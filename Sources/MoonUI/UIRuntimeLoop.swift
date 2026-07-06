import Foundation

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
        let hit = HitTest.locate(currentScene, x: x, y: y)
        let pressedID = hit?.node.kind == .button && hit?.node.payload.enabled == true ? hit?.node.id : nil
        if interaction.pressedNodeID == pressedID {
            return false
        }
        interaction.pressedNodeID = pressedID
        return true
    }

    public func handleClick(x: Float, y: Float) async throws -> Bool {
        defer { interaction.pressedNodeID = nil }
        guard let currentScene = scene else { return false }
        guard let hit = HitTest.locate(currentScene, x: x, y: y),
              let onPress = hit.node.payload.onPress,
              hit.node.payload.enabled else {
            return false
        }
        try await session.dispatchMessage(onPress)
        scene = nil
        return true
    }
}