import Foundation
import MoonRuntime
import MoonYoga

public struct UIRect: Equatable, Sendable {
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

    public init(_ rect: LayoutRect) {
        self.x = rect.x
        self.y = rect.y
        self.width = rect.width
        self.height = rect.height
    }

    public var right: Float { x + width }
    public var bottom: Float { y + height }

    public func contains(px: Float, py: Float) -> Bool {
        px >= x && py >= y && px < right && py < bottom
    }
}

public struct UIColor: Equatable, Sendable {
    public var r: UInt8
    public var g: UInt8
    public var b: UInt8
    public var a: UInt8

    public init(r: UInt8, g: UInt8, b: UInt8, a: UInt8 = 255) {
        self.r = r
        self.g = g
        self.b = b
        self.a = a
    }
}

public enum ElementKind: String, Sendable {
    case text
    case button
    case input
    case list
    case column
    case row
    case card
    case spacer
    case padding
    case frame
    case container
    case unsupported
}

public struct ElementPayload: Sendable {
    public var text: String?
    public var textStyle: UITextStyle?
    public var placeholder: String?
    public var onPress: RuntimeValue?
    public var onChange: RuntimeValue?
    public var onScroll: RuntimeValue?
    public var scrollOffset: Int
    public var enabled: Bool
    public var foreground: UIColor?

    public init(
        text: String? = nil,
        textStyle: UITextStyle? = nil,
        placeholder: String? = nil,
        onPress: RuntimeValue? = nil,
        onChange: RuntimeValue? = nil,
        onScroll: RuntimeValue? = nil,
        scrollOffset: Int = 0,
        enabled: Bool = true,
        foreground: UIColor? = nil
    ) {
        self.text = text
        self.textStyle = textStyle
        self.placeholder = placeholder
        self.onPress = onPress
        self.onChange = onChange
        self.onScroll = onScroll
        self.scrollOffset = scrollOffset
        self.enabled = enabled
        self.foreground = foreground
    }
}

public final class SceneNode: @unchecked Sendable {
    public let id: UInt64
    public var kind: ElementKind
    public var bounds: UIRect
    public var payload: ElementPayload
    public var children: [SceneNode]
    public var elementHash: UInt64
    public var dirty: Bool

    public init(
        id: UInt64,
        kind: ElementKind,
        bounds: UIRect,
        payload: ElementPayload = ElementPayload(),
        children: [SceneNode] = [],
        elementHash: UInt64 = 0,
        dirty: Bool = true
    ) {
        self.id = id
        self.kind = kind
        self.bounds = bounds
        self.payload = payload
        self.children = children
        self.elementHash = elementHash
        self.dirty = dirty
    }
}

public struct UISize: Equatable, Sendable {
    public var width: Float
    public var height: Float

    public init(width: Float, height: Float) {
        self.width = width
        self.height = height
    }
}

public struct UIBorder: Equatable, Sendable {
    public var color: UIColor
    public var width: Float

    public init(color: UIColor, width: Float = 1) {
        self.color = color
        self.width = width
    }
}