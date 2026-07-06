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
        walk(root, x: x, y: y)
    }

    private static func walk(_ node: SceneNode, x: Float, y: Float) -> HitTestResult? {
        guard node.bounds.contains(px: x, py: y) else { return nil }

        for child in node.children.reversed() {
            if let hit = walk(child, x: x, y: y) {
                return hit
            }
        }

        if node.kind == .button, node.payload.onPress != nil {
            return HitTestResult(node: node, x: x, y: y)
        }
        return nil
    }
}