import Foundation
import MoonRuntime
import MoonYoga

public final class UIRuntimeLoop: @unchecked Sendable {
    private let session: MoonAppSession
    private var scene: SceneNode?
    private var viewport = UIRect(x: 0, y: 0, width: 480, height: 360)
    private var interaction = InteractionState()

    public init(session: MoonAppSession) {
        self.session = session
        viewport = UIRect(
            x: 0,
            y: 0,
            width: Float(session.options.width),
            height: Float(session.options.height)
        )
    }

    public func resize(width: Float, height: Float) {
        viewport = UIRect(x: 0, y: 0, width: width, height: height)
        scene = nil
    }

    public func rebuildScene() async throws -> SceneDiffResult {
        let next = try await session.buildScene(width: viewport.width, height: viewport.height)
        let diff = SceneDiff.apply(previous: scene, next: next, viewport: viewport)
        scene = diff.root
        return diff
    }

    public func render(backend: RenderBackend) async throws {
        if scene == nil {
            _ = try await rebuildScene()
        }
        guard let scene else { return }
        try SceneRenderer.render(scene, backend: backend, interaction: interaction)
    }

    public func handleMouseMove(x: Float, y: Float) -> Bool {
        guard let currentScene = scene else { return false }
        let hovered = HitTest.locate(currentScene, x: x, y: y)
        let hoveredID = hovered?.node.kind == .button ? hovered?.node.id : nil
        if interaction.hoveredNodeID == hoveredID {
            return false
        }
        interaction.hoveredNodeID = hoveredID
        return true
    }

    public func handleMouseDown(x: Float, y: Float) -> Bool {
        guard let currentScene = scene else { return false }
        var changed = false

        if let inputHit = HitTest.locateInput(currentScene, x: x, y: y) {
            let localX = x - inputHit.node.bounds.x
            let value = inputHit.node.payload.text ?? ""
            let cursor = TextMetrics.cursorIndex(atX: localX, text: value, style: .body, padding: 12)
            interaction.input.focus(nodeID: inputHit.node.id, cursor: cursor)
            interaction.pressedNodeID = nil
            return true
        }

        interaction.input.clearFocus()
        changed = true

        let hit = HitTest.locate(currentScene, x: x, y: y)
        let pressedID = hit?.node.kind == .button && hit?.node.payload.enabled == true ? hit?.node.id : nil
        if interaction.pressedNodeID != pressedID {
            interaction.pressedNodeID = pressedID
            changed = true
        }
        return changed
    }

    public func handleClick(x: Float, y: Float) async throws -> Bool {
        defer { interaction.pressedNodeID = nil }
        guard let currentScene = scene else { return false }
        if HitTest.locateInput(currentScene, x: x, y: y) != nil {
            return false
        }
        guard let hit = HitTest.locate(currentScene, x: x, y: y),
              hit.node.kind == .button,
              let onPress = hit.node.payload.onPress,
              hit.node.payload.enabled else {
            return false
        }
        try await session.dispatchMessage(onPress)
        scene = nil
        return true
    }

    public func handleMouseWheel(delta: Int, x: Float, y: Float) async throws -> Bool {
        guard let currentScene = scene else { return false }
        guard let listHit = HitTest.locateList(currentScene, x: x, y: y),
              let onScroll = listHit.node.payload.onScroll else {
            return false
        }

        let contentHeight = ListScroll.contentHeight(for: listHit.node)
        let proposed = ListScroll.wheelDeltaToOffset(
            current: listHit.node.payload.scrollOffset,
            delta: delta
        )
        let clamped = ListScroll.clampedOffset(
            proposed,
            viewportHeight: listHit.node.bounds.height,
            contentHeight: contentHeight
        )
        if clamped == listHit.node.payload.scrollOffset {
            return false
        }

        try await session.dispatchOnChange(onScroll, value: .int(clamped))
        scene = nil
        return true
    }

    public func handleKeyChar(_ codeUnit: UInt16) async throws -> Bool {
        guard let currentScene = scene,
              let nodeID = interaction.input.focusedNodeID,
              let inputNode = findNode(currentScene, id: nodeID),
              let onChange = inputNode.payload.onChange else {
            return false
        }

        guard let scalar = UnicodeScalar(codeUnit), scalar.isASCII, !scalar.properties.isWhitespace || codeUnit == 32 else {
            return false
        }
        let character = Character(scalar)
        if character == "\n" || character == "\r" {
            return false
        }

        let value = inputNode.payload.text ?? ""
        let selection = interaction.input.selectionRange
        let baseValue: String
        let baseCursor: Int
        if let selection {
            let replaced = InputEditor.deleteBackward(value, cursor: interaction.input.cursor, selection: selection)
            baseValue = replaced.0
            baseCursor = replaced.1
            interaction.input.selectionAnchor = nil
        } else {
            baseValue = value
            baseCursor = interaction.input.cursor
        }

        let edited = InputEditor.insert(String(character), into: baseValue, at: baseCursor)
        interaction.input.cursor = edited.1
        try await session.dispatchOnChange(onChange, value: .string(edited.0))
        scene = nil
        return true
    }

    public func handleKeyDown(virtualKey: Int32, controlPressed: Bool) async throws -> Bool {
        guard let currentScene = scene,
              let nodeID = interaction.input.focusedNodeID,
              let inputNode = findNode(currentScene, id: nodeID),
              let onChange = inputNode.payload.onChange else {
            return false
        }

        let value = inputNode.payload.text ?? ""
        let selection = interaction.input.selectionRange

        if controlPressed, virtualKey == 65 {
            interaction.input.selectAll(textCount: value.count)
            return true
        }

        if controlPressed, virtualKey == 86 {
            #if os(Windows)
            guard let pasted = WinClipboard.readText(), !pasted.isEmpty else { return false }
            let sanitized = pasted.replacingOccurrences(of: "\n", with: " ").replacingOccurrences(of: "\r", with: "")
            let base: String
            let cursor: Int
            if let selection {
                let replaced = InputEditor.deleteBackward(value, cursor: interaction.input.cursor, selection: selection)
                base = replaced.0
                cursor = replaced.1
                interaction.input.selectionAnchor = nil
            } else {
                base = value
                cursor = interaction.input.cursor
            }
            let edited = InputEditor.insert(sanitized, into: base, at: cursor)
            interaction.input.cursor = edited.1
            try await session.dispatchOnChange(onChange, value: .string(edited.0))
            scene = nil
            return true
            #else
            return false
            #endif
        }

        var nextValue = value
        var nextCursor = interaction.input.cursor
        var changed = false

        switch virtualKey {
        case 8: // Backspace
            let edited = InputEditor.deleteBackward(value, cursor: interaction.input.cursor, selection: selection)
            nextValue = edited.0
            nextCursor = edited.1
            interaction.input.selectionAnchor = nil
            changed = true
        case 46: // Delete
            let edited = InputEditor.deleteForward(value, cursor: interaction.input.cursor, selection: selection)
            nextValue = edited.0
            nextCursor = edited.1
            interaction.input.selectionAnchor = nil
            changed = true
        case 37: // Left
            let moved = InputEditor.moveCursor(value, cursor: interaction.input.cursor, delta: -1, extendSelection: false)
            nextCursor = moved.0
            interaction.input.selectionAnchor = moved.1
            return true
        case 39: // Right
            let moved = InputEditor.moveCursor(value, cursor: interaction.input.cursor, delta: 1, extendSelection: false)
            nextCursor = moved.0
            interaction.input.selectionAnchor = moved.1
            return true
        case 36: // Home
            nextCursor = 0
            interaction.input.selectionAnchor = nil
            return true
        case 35: // End
            nextCursor = value.count
            interaction.input.selectionAnchor = nil
            return true
        default:
            return false
        }

        guard changed else { return false }
        interaction.input.cursor = nextCursor
        try await session.dispatchOnChange(onChange, value: .string(nextValue))
        scene = nil
        return true
    }

    private func findNode(_ root: SceneNode, id: UInt64) -> SceneNode? {
        if root.id == id { return root }
        for child in root.children {
            if let found = findNode(child, id: id) {
                return found
            }
        }
        return nil
    }
}

extension MoonAppSession {
    func dispatchOnChange(_ onChange: RuntimeValue, value: RuntimeValue) async throws {
        let msg = try await applyRuntimeFunction(onChange, value, ctx: ctx)
        try await dispatchMessage(msg)
    }
}