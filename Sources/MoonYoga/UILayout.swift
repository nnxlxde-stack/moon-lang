import Foundation

public struct LayoutRect: Equatable, Sendable {
    public var x: Float
    public var y: Float
    public var width: Float
    public var height: Float

    public init(x: Float, y: Float, width: Float, height: Float) {
        self.x = x
        self.y = y
        self.width = width
        self.height = height
    }
}

public enum UIAlign: Sendable {
    case start
    case center
    case end
    case stretch
}

public enum UITextStyle: Sendable {
    case title
    case headline
    case body
    case caption
    case monospace
}

public indirect enum UILayoutElement: Sendable {
    case text(content: String, style: UITextStyle)
    case button(label: UILayoutElement, minHeight: Float = 36, horizontalPadding: Float = 12)
    case column(spacing: Float, padding: Float, align: UIAlign, children: [UILayoutElement])
    case row(spacing: Float, padding: Float, align: UIAlign, children: [UILayoutElement])
    case card(padding: Float, child: UILayoutElement)
    case spacer
    case padding(all: Float, child: UILayoutElement)
    case paddingXY(horizontal: Float, vertical: Float, child: UILayoutElement)
    case frame(width: Float, height: Float, child: UILayoutElement)
    case input(minHeight: Float = 36, horizontalPadding: Float = 12)
    case list(spacing: Float, padding: Float, children: [UILayoutElement])
}

public struct LayoutNode: Identifiable, Sendable {
    public var id: UInt64
    public var kind: String
    public var rect: LayoutRect
    public var children: [LayoutNode]

    public init(id: UInt64, kind: String, rect: LayoutRect, children: [LayoutNode] = []) {
        self.id = id
        self.kind = kind
        self.rect = rect
        self.children = children
    }
}

public struct LayoutResult: Sendable {
    public var root: LayoutNode
    public var viewport: LayoutRect

    public init(root: LayoutNode, viewport: LayoutRect) {
        self.root = root
        self.viewport = viewport
    }
}