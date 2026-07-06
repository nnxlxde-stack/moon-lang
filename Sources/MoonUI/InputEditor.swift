import Foundation
import MoonYoga

public struct InputEditorState: Sendable, Equatable {
    public var focusedNodeID: UInt64?
    public var cursor: Int
    public var selectionAnchor: Int?

    public init(
        focusedNodeID: UInt64? = nil,
        cursor: Int = 0,
        selectionAnchor: Int? = nil
    ) {
        self.focusedNodeID = focusedNodeID
        self.cursor = cursor
        self.selectionAnchor = selectionAnchor
    }

    public var selectionRange: Range<Int>? {
        guard let anchor = selectionAnchor else { return nil }
        let lower = min(anchor, cursor)
        let upper = max(anchor, cursor)
        guard lower < upper else { return nil }
        return lower..<upper
    }

    public mutating func focus(nodeID: UInt64, cursor: Int) {
        focusedNodeID = nodeID
        self.cursor = max(0, cursor)
        selectionAnchor = nil
    }

    public mutating func clearFocus() {
        focusedNodeID = nil
        selectionAnchor = nil
    }

    public mutating func selectAll(textCount: Int) {
        cursor = textCount
        selectionAnchor = 0
    }
}

public enum InputEditor {
    public static func insert(_ text: String, into value: String, at cursor: Int) -> (String, Int) {
        let index = clamp(cursor, upperBound: value.count)
        let start = value.index(value.startIndex, offsetBy: index)
        var next = value
        next.insert(contentsOf: text, at: start)
        return (next, index + text.count)
    }

    public static func deleteBackward(
        _ value: String,
        cursor: Int,
        selection: Range<Int>?
    ) -> (String, Int) {
        if let selection {
            return replace(value, range: selection, with: "")
        }
        guard cursor > 0 else { return (value, 0) }
        let start = value.index(value.startIndex, offsetBy: cursor - 1)
        let end = value.index(value.startIndex, offsetBy: cursor)
        var next = value
        next.removeSubrange(start..<end)
        return (next, cursor - 1)
    }

    public static func deleteForward(
        _ value: String,
        cursor: Int,
        selection: Range<Int>?
    ) -> (String, Int) {
        if let selection {
            return replace(value, range: selection, with: "")
        }
        guard cursor < value.count else { return (value, cursor) }
        let start = value.index(value.startIndex, offsetBy: cursor)
        let end = value.index(after: start)
        var next = value
        next.removeSubrange(start..<end)
        return (next, cursor)
    }

    public static func moveCursor(
        _ value: String,
        cursor: Int,
        delta: Int,
        extendSelection: Bool
    ) -> (Int, Int?) {
        let next = clamp(cursor + delta, upperBound: value.count)
        if extendSelection {
            return (next, next)
        }
        return (next, nil)
    }

    private static func replace(_ value: String, range: Range<Int>, with replacement: String) -> (String, Int) {
        let start = value.index(value.startIndex, offsetBy: range.lowerBound)
        let end = value.index(value.startIndex, offsetBy: range.upperBound)
        var next = value
        next.replaceSubrange(start..<end, with: replacement)
        return (next, range.lowerBound + replacement.count)
    }

    private static func clamp(_ value: Int, upperBound: Int) -> Int {
        min(max(0, value), upperBound)
    }
}