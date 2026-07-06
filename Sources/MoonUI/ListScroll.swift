import Foundation

public enum ListScroll {
    public static func contentHeight(for list: SceneNode) -> Float {
        guard !list.children.isEmpty else { return 0 }
        let top = list.children.map(\.bounds.y).min() ?? list.bounds.y
        let bottom = list.children.map(\.bounds.bottom).max() ?? list.bounds.bottom
        return max(0, bottom - top)
    }

    public static func clampedOffset(
        _ offset: Int,
        viewportHeight: Float,
        contentHeight: Float
    ) -> Int {
        let maxOffset = max(0, Int((contentHeight - viewportHeight).rounded(.up)))
        return min(max(0, offset), maxOffset)
    }

    public static func adjustedBounds(
        _ child: SceneNode,
        list: SceneNode,
        scrollOffset: Float
    ) -> UIRect {
        UIRect(
            x: child.bounds.x,
            y: child.bounds.y - scrollOffset,
            width: child.bounds.width,
            height: child.bounds.height
        )
    }

    public static func intersects(_ rect: UIRect, viewport: UIRect) -> Bool {
        rect.bottom > viewport.y
            && rect.y < viewport.bottom
            && rect.right > viewport.x
            && rect.x < viewport.right
    }

    public static func wheelDeltaToOffset(current: Int, delta: Int, step: Int = 40) -> Int {
        current - (delta / 120) * step
    }
}