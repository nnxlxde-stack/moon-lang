import Foundation

public enum TextMetrics {
    public static func size(for text: String, style: UITextStyle) -> LayoutRect {
        let charWidth = charWidth(for: style)
        let lineHeight = lineHeight(for: style)
        let count = Float(max(text.count, 1))
        return LayoutRect(x: 0, y: 0, width: count * charWidth, height: lineHeight)
    }

    public static func charWidth(for style: UITextStyle) -> Float {
        switch style {
        case .title: return 12
        case .headline: return 10
        case .body: return 8
        case .caption: return 7
        case .monospace: return 8.5
        }
    }

    public static func lineHeight(for style: UITextStyle) -> Float {
        switch style {
        case .title: return 32
        case .headline: return 26
        case .body: return 20
        case .caption: return 16
        case .monospace: return 18
        }
    }

    public static func cursorIndex(atX: Float, text: String, style: UITextStyle, padding: Float) -> Int {
        let relativeX = max(0, atX - padding)
        let index = Int((relativeX / charWidth(for: style)).rounded(.down))
        return min(max(0, index), text.count)
    }
}