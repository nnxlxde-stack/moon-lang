import Foundation
import MoonYoga

enum SceneRenderer {
    static func render(_ root: SceneNode, backend: RenderBackend) throws {
        try backend.beginFrame(clear: UITheme.background)
        draw(node: root, backend: backend)
        try backend.endFrame()
    }

    private static func draw(node: SceneNode, backend: RenderBackend) {
        switch node.kind {
        case .card:
            backend.drawRect(node.bounds, fill: UITheme.surface, radius: UITheme.cardRadius, border: UIBorder(color: UITheme.border))
        case .button:
            backend.drawRect(node.bounds, fill: UITheme.accent, radius: UITheme.buttonRadius, border: nil)
        case .text:
            if let text = node.payload.text {
                let color = node.payload.foreground ?? UITheme.text
                backend.drawText(text, rect: node.bounds, style: node.payload.textStyle ?? .body, color: color)
            }
        default:
            break
        }

        for child in node.children {
            draw(node: child, backend: backend)
        }
    }
}