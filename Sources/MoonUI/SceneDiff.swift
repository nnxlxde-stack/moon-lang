import Foundation

public struct SceneDiffResult: Sendable {
    public var root: SceneNode
    public var dirtyRects: [UIRect]

    public init(root: SceneNode, dirtyRects: [UIRect]) {
        self.root = root
        self.dirtyRects = dirtyRects
    }
}

public enum SceneDiff {
    public static func apply(previous: SceneNode?, next: SceneNode, viewport: UIRect) -> SceneDiffResult {
        var dirty: [UIRect] = []
        if let previous {
            reconcile(previous: previous, next: next, dirty: &dirty)
        } else {
            collectBounds(next, into: &dirty)
            next.dirty = true
        }
        if dirty.isEmpty {
            dirty.append(viewport)
        }
        return SceneDiffResult(root: next, dirtyRects: dirty)
    }

    private static func reconcile(previous: SceneNode, next: SceneNode, dirty: inout [UIRect]) {
        if previous.elementHash != next.elementHash || previous.kind != next.kind || previous.bounds != next.bounds {
            dirty.append(previous.bounds)
            dirty.append(next.bounds)
            next.dirty = true
        } else {
            next.dirty = false
        }

        let pairCount = max(previous.children.count, next.children.count)
        for index in 0..<pairCount {
            if index < previous.children.count, index < next.children.count {
                reconcile(previous: previous.children[index], next: next.children[index], dirty: &dirty)
            } else if index < previous.children.count {
                dirty.append(previous.children[index].bounds)
            } else {
                collectBounds(next.children[index], into: &dirty)
                next.children[index].dirty = true
            }
        }
    }

    private static func collectBounds(_ node: SceneNode, into rects: inout [UIRect]) {
        rects.append(node.bounds)
        for child in node.children {
            collectBounds(child, into: &rects)
        }
    }
}