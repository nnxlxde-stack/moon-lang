import Foundation
import MoonYoga

enum SceneRenderer {
    private static let inputPadding: Float = 12

    static func render(
        _ root: SceneNode,
        backend: RenderBackend,
        interaction: InteractionState = InteractionState()
    ) throws {
        try backend.beginFrame(clear: UITheme.background)
        draw(node: root, backend: backend, interaction: interaction, clip: nil, offsetY: 0)
        try backend.endFrame()
    }

    private static func draw(
        node: SceneNode,
        backend: RenderBackend,
        interaction: InteractionState,
        clip: UIRect?,
        offsetY: Float
    ) {
        let bounds = offsetBounds(node.bounds, offsetY: offsetY)

        switch node.kind {
        case .card:
            drawRect(bounds, backend: backend, fill: UITheme.surface, radius: UITheme.cardRadius, border: UIBorder(color: UITheme.border), clip: clip)
        case .button:
            let fill = ButtonAppearance.fill(node: node, interaction: interaction)
            drawRect(bounds, backend: backend, fill: fill, radius: UITheme.buttonRadius, border: nil, clip: clip)
        case .input:
            drawInput(node, bounds: bounds, backend: backend, interaction: interaction, clip: clip)
        case .list:
            drawList(node, bounds: bounds, backend: backend, interaction: interaction, clip: clip)
        case .text:
            if let text = node.payload.text {
                let color = node.payload.foreground ?? UITheme.text
                drawText(text, rect: bounds, backend: backend, style: node.payload.textStyle ?? .body, color: color, clip: clip)
            }
        default:
            break
        }

        if node.kind != .list {
            for child in node.children {
                draw(node: child, backend: backend, interaction: interaction, clip: clip, offsetY: offsetY)
            }
        }
    }

    private static func drawList(
        _ node: SceneNode,
        bounds: UIRect,
        backend: RenderBackend,
        interaction: InteractionState,
        clip: UIRect?
    ) {
        drawRect(bounds, backend: backend, fill: UITheme.surface, radius: UITheme.cardRadius, border: UIBorder(color: UITheme.border), clip: clip)
        let scrollOffset = Float(node.payload.scrollOffset)
        let listClip = intersectClip(clip, bounds)
        for child in node.children {
            let adjusted = ListScroll.adjustedBounds(child, list: node, scrollOffset: scrollOffset)
            guard ListScroll.intersects(adjusted, viewport: bounds) else { continue }
            let childOffset = adjusted.y - child.bounds.y
            draw(node: child, backend: backend, interaction: interaction, clip: listClip, offsetY: childOffset)
        }
    }

    private static func drawInput(
        _ node: SceneNode,
        bounds: UIRect,
        backend: RenderBackend,
        interaction: InteractionState,
        clip: UIRect?
    ) {
        let focused = interaction.input.focusedNodeID == node.id
        let borderColor = focused ? UITheme.accent : UITheme.border
        drawRect(bounds, backend: backend, fill: UITheme.surface, radius: UITheme.buttonRadius, border: UIBorder(color: borderColor), clip: clip)

        let value = node.payload.text ?? ""
        let placeholder = node.payload.placeholder ?? ""
        let display = value.isEmpty ? placeholder : value
        let color = value.isEmpty ? UITheme.textMuted : UITheme.text
        let textRect = UIRect(
            x: bounds.x + inputPadding,
            y: bounds.y + 8,
            width: max(0, bounds.width - inputPadding * 2),
            height: max(0, bounds.height - 16)
        )
        drawText(display, rect: textRect, backend: backend, style: .body, color: color, clip: clip)

        guard focused else { return }

        if let selection = interaction.input.selectionRange, !value.isEmpty {
            let startX = textRect.x + TextMetrics.charWidth(for: .body) * Float(selection.lowerBound)
            let endX = textRect.x + TextMetrics.charWidth(for: .body) * Float(selection.upperBound)
            let selectionRect = UIRect(
                x: startX,
                y: textRect.y,
                width: max(2, endX - startX),
                height: textRect.height
            )
            drawRect(selectionRect, backend: backend, fill: UITheme.accent.withAlpha(0.35), radius: 0, border: nil, clip: clip)
            drawText(value, rect: textRect, backend: backend, style: .body, color: UITheme.text, clip: clip)
        }

        let caretX = textRect.x + TextMetrics.charWidth(for: .body) * Float(interaction.input.cursor)
        let caretRect = UIRect(x: caretX, y: textRect.y + 2, width: 2, height: textRect.height - 4)
        drawRect(caretRect, backend: backend, fill: UITheme.text, radius: 0, border: nil, clip: clip)
    }

    private static func offsetBounds(_ bounds: UIRect, offsetY: Float) -> UIRect {
        UIRect(x: bounds.x, y: bounds.y + offsetY, width: bounds.width, height: bounds.height)
    }

    private static func drawRect(
        _ rect: UIRect,
        backend: RenderBackend,
        fill: UIColor,
        radius: Float,
        border: UIBorder?,
        clip: UIRect?
    ) {
        guard let clipped = clipRect(rect, clip: clip) else { return }
        backend.drawRect(clipped, fill: fill, radius: radius, border: border)
    }

    private static func drawText(
        _ text: String,
        rect: UIRect,
        backend: RenderBackend,
        style: UITextStyle,
        color: UIColor,
        clip: UIRect?
    ) {
        guard let clipped = clipRect(rect, clip: clip) else { return }
        backend.drawText(text, rect: clipped, style: style, color: color)
    }

    private static func clipRect(_ rect: UIRect, clip: UIRect?) -> UIRect? {
        guard let clip else { return rect }
        let x = max(rect.x, clip.x)
        let y = max(rect.y, clip.y)
        let right = min(rect.right, clip.right)
        let bottom = min(rect.bottom, clip.bottom)
        guard right > x, bottom > y else { return nil }
        return UIRect(x: x, y: y, width: right - x, height: bottom - y)
    }

    private static func intersectClip(_ outer: UIRect?, _ inner: UIRect) -> UIRect {
        guard let outer else { return inner }
        guard let clipped = clipRect(inner, clip: outer) else { return inner }
        return clipped
    }
}

private extension UIColor {
    func withAlpha(_ alpha: Float) -> UIColor {
        UIColor(r: r, g: g, b: b, a: UInt8(clamping: Int(Float(a) * alpha)))
    }
}