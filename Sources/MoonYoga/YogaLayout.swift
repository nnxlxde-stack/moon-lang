import YogaCAPI
import Foundation

public enum YogaLayoutError: Error, Sendable {
    case invalidTree
}

public struct YogaLayoutEngine: Sendable {
    public init() {}

    public func layout(
        _ element: UILayoutElement,
        viewportWidth: Float,
        viewportHeight: Float
    ) throws -> LayoutResult {
        var nextID: UInt64 = 1
        var measureBoxes: [MeasureBox] = []
        let root = YogaOwnedNode(YGNodeNew())
        defer { YGNodeFreeRecursive(root.ref) }

        YGNodeStyleSetWidthPercent(root.ref, 100)
        YGNodeStyleSetHeightPercent(root.ref, 100)
        YGNodeStyleSetFlexGrow(root.ref, 1)

        try build(element, into: root, nextID: &nextID, measureBoxes: &measureBoxes)

        YGNodeCalculateLayout(
            root.ref,
            viewportWidth,
            viewportHeight,
            YGDirectionLTR
        )

        let viewport = LayoutRect(x: 0, y: 0, width: viewportWidth, height: viewportHeight)
        let tree = collectTree(root.ref, nextID: &nextID, originX: 0, originY: 0)
        return LayoutResult(root: tree, viewport: viewport)
    }
}

// MARK: - Owned node

private final class YogaOwnedNode {
    let ref: YGNodeRef

    init(_ ref: YGNodeRef) {
        self.ref = ref
    }

    func addChild(_ child: YogaOwnedNode) {
        YGNodeInsertChild(ref, child.ref, YGNodeGetChildCount(ref))
    }
}

// MARK: - Measure context

private final class MeasureBox: @unchecked Sendable {
    let width: Float
    let height: Float

    init(width: Float, height: Float) {
        self.width = width
        self.height = height
    }
}

private func cMeasureLeaf(
    node: YGNodeConstRef?,
    width: Float,
    widthMode: YGMeasureMode,
    height: Float,
    heightMode: YGMeasureMode
) -> YGSize {
    guard let node, let raw = YGNodeGetContext(node) else {
        return YGSize(width: 0, height: 0)
    }
    let box = Unmanaged<MeasureBox>.fromOpaque(raw).takeUnretainedValue()
    var measuredWidth = box.width
    var measuredHeight = box.height

    if widthMode == YGMeasureModeExactly {
        measuredWidth = width
    } else if widthMode == YGMeasureModeAtMost {
        measuredWidth = min(measuredWidth, width)
    }

    if heightMode == YGMeasureModeExactly {
        measuredHeight = height
    } else if heightMode == YGMeasureModeAtMost {
        measuredHeight = min(measuredHeight, height)
    }

    return YGSize(width: measuredWidth, height: measuredHeight)
}

// MARK: - Build

private func build(
    _ element: UILayoutElement,
    into parent: YogaOwnedNode,
    nextID: inout UInt64,
    measureBoxes: inout [MeasureBox]
) throws {
    switch element {
    case .text(let content, let style):
        let node = YogaOwnedNode(YGNodeNew())
        let size = measureText(content, style: style)
        let box = MeasureBox(width: size.width, height: size.height)
        measureBoxes.append(box)
        YGNodeSetContext(node.ref, Unmanaged.passUnretained(measureBoxes.last!).toOpaque())
        YGNodeSetMeasureFunc(node.ref, cMeasureLeaf)
        parent.addChild(node)

    case .button(let label, let minHeight, let horizontalPadding):
        let node = YogaOwnedNode(YGNodeNew())
        YGNodeStyleSetMinHeight(node.ref, minHeight)
        YGNodeStyleSetPadding(node.ref, YGEdgeHorizontal, horizontalPadding)
        YGNodeStyleSetAlignItems(node.ref, mapAlign(.center))
        YGNodeStyleSetJustifyContent(node.ref, YGJustifyCenter)
        try build(label, into: node, nextID: &nextID, measureBoxes: &measureBoxes)
        parent.addChild(node)

    case .column(let spacing, let padding, let align, let children):
        let node = YogaOwnedNode(YGNodeNew())
        YGNodeStyleSetFlexDirection(node.ref, YGFlexDirectionColumn)
        YGNodeStyleSetGap(node.ref, YGGutterAll, spacing)
        if padding > 0 {
            YGNodeStyleSetPadding(node.ref, YGEdgeAll, padding)
        }
        applyCrossAxisAlignment(node.ref, direction: .column, align: align)
        for child in children {
            try build(child, into: node, nextID: &nextID, measureBoxes: &measureBoxes)
        }
        parent.addChild(node)

    case .row(let spacing, let padding, let align, let children):
        let node = YogaOwnedNode(YGNodeNew())
        YGNodeStyleSetFlexDirection(node.ref, YGFlexDirectionRow)
        YGNodeStyleSetGap(node.ref, YGGutterAll, spacing)
        if padding > 0 {
            YGNodeStyleSetPadding(node.ref, YGEdgeAll, padding)
        }
        applyCrossAxisAlignment(node.ref, direction: .row, align: align)
        for child in children {
            try build(child, into: node, nextID: &nextID, measureBoxes: &measureBoxes)
        }
        parent.addChild(node)

    case .card(let padding, let child):
        let node = YogaOwnedNode(YGNodeNew())
        if padding > 0 {
            YGNodeStyleSetPadding(node.ref, YGEdgeAll, padding)
        }
        try build(child, into: node, nextID: &nextID, measureBoxes: &measureBoxes)
        parent.addChild(node)

    case .spacer:
        let node = YogaOwnedNode(YGNodeNew())
        YGNodeStyleSetFlexGrow(node.ref, 1)
        parent.addChild(node)

    case .padding(let all, let child):
        let node = YogaOwnedNode(YGNodeNew())
        YGNodeStyleSetPadding(node.ref, YGEdgeAll, all)
        try build(child, into: node, nextID: &nextID, measureBoxes: &measureBoxes)
        parent.addChild(node)

    case .paddingXY(let horizontal, let vertical, let child):
        let node = YogaOwnedNode(YGNodeNew())
        YGNodeStyleSetPadding(node.ref, YGEdgeHorizontal, horizontal)
        YGNodeStyleSetPadding(node.ref, YGEdgeVertical, vertical)
        try build(child, into: node, nextID: &nextID, measureBoxes: &measureBoxes)
        parent.addChild(node)

    case .frame(let width, let height, let child):
        let node = YogaOwnedNode(YGNodeNew())
        YGNodeStyleSetWidth(node.ref, width)
        YGNodeStyleSetHeight(node.ref, height)
        try build(child, into: node, nextID: &nextID, measureBoxes: &measureBoxes)
        parent.addChild(node)
    }
}

// MARK: - Collect

private func collectTree(
    _ node: YGNodeRef,
    nextID: inout UInt64,
    originX: Float,
    originY: Float
) -> LayoutNode {
    let id = nextID
    nextID += 1
    let rect = LayoutRect(
        x: originX + YGNodeLayoutGetLeft(node),
        y: originY + YGNodeLayoutGetTop(node),
        width: YGNodeLayoutGetWidth(node),
        height: YGNodeLayoutGetHeight(node)
    )
    let childOriginX = rect.x
    let childOriginY = rect.y
    let childCount = Int(YGNodeGetChildCount(node))
    var children: [LayoutNode] = []
    children.reserveCapacity(childCount)
    for index in 0..<childCount {
        guard let child = YGNodeGetChild(node, index) else { continue }
        children.append(collectTree(child, nextID: &nextID, originX: childOriginX, originY: childOriginY))
    }
    let kind = childCount == 0 ? "leaf" : "container"
    return LayoutNode(id: id, kind: kind, rect: rect, children: children)
}

// MARK: - Metrics

private func measureText(_ content: String, style: UITextStyle) -> LayoutRect {
    let charWidth: Float
    let lineHeight: Float
    switch style {
    case .title:
        charWidth = 12
        lineHeight = 32
    case .headline:
        charWidth = 10
        lineHeight = 26
    case .body:
        charWidth = 8
        lineHeight = 20
    case .caption:
        charWidth = 7
        lineHeight = 16
    case .monospace:
        charWidth = 8.5
        lineHeight = 18
    }
    let count = Float(max(content.count, 1))
    return LayoutRect(x: 0, y: 0, width: count * charWidth, height: lineHeight)
}

private func mapAlign(_ align: UIAlign) -> YGAlign {
    switch align {
    case .start: return YGAlignFlexStart
    case .center: return YGAlignCenter
    case .end: return YGAlignFlexEnd
    case .stretch: return YGAlignStretch
    }
}

private enum FlexDirectionAxis {
    case row
    case column
}

private func applyCrossAxisAlignment(
    _ node: YGNodeRef,
    direction: FlexDirectionAxis,
    align: UIAlign
) {
    let mapped = mapAlign(align)
    switch direction {
    case .column:
        YGNodeStyleSetAlignItems(node, mapped)
    case .row:
        YGNodeStyleSetAlignItems(node, mapped)
    }
}