import Foundation

public struct HitTestResult: Sendable {
    public var node: SceneNode
    public var x: Float
    public var y: Float

    public init(node: SceneNode, x: Float, y: Float) {
        self.node = node
        self.x = x
        self.y = y
    }
}

public enum HitTest {
    public static func locate(_ root: SceneNode, x: Float, y: Float) -> HitTestResult? {
        walkInteractive(root, x: x, y: y)
    }

    public static func locateList(_ root: SceneNode, x: Float, y: Float) -> HitTestResult? {
        walkList(root, x: x, y: y)
    }

    public static func locateInput(_ root: SceneNode, x: Float, y: Float) -> HitTestResult? {
        walkInput(root, x: x, y: y)
    }

    private static func walkInteractive(_ node: SceneNode, x: Float, y: Float) -> HitTestResult? {
        guard node.bounds.contains(px: x, py: y) else { return nil }

        for child in node.children.reversed() {
            if let hit = walkInteractive(child, x: x, y: y) {
                return hit
            }
        }

        switch node.kind {
        case .button where node.payload.onPress != nil:
            return HitTestResult(node: node, x: x, y: y)
        case .input where node.payload.onChange != nil:
            return HitTestResult(node: node, x: x, y: y)
        default:
            return nil
        }
    }

    private static func walkList(_ node: SceneNode, x: Float, y: Float) -> HitTestResult? {
        guard node.bounds.contains(px: x, py: y) else { return nil }

        for child in node.children.reversed() {
            if let hit = walkList(child, x: x, y: y) {
                return hit
            }
        }

        if node.kind == .list, node.payload.onScroll != nil {
            return HitTestResult(node: node, x: x, y: y)
        }
        return nil
    }

    private static func walkInput(_ node: SceneNode, x: Float, y: Float) -> HitTestResult? {
        guard node.bounds.contains(px: x, py: y) else { return nil }

        for child in node.children.reversed() {
            if let hit = walkInput(child, x: x, y: y) {
                return hit
            }
        }

        if node.kind == .input, node.payload.onChange != nil {
            return HitTestResult(node: node, x: x, y: y)
        }
        return nil
    }
}