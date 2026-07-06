import Foundation
import MoonRuntime
import MoonYoga

enum MoonElementBridge {
    static func toLayoutElement(_ value: RuntimeValue) throws -> UILayoutElement {
        guard case .record(let typeName, let fields) = value, let typeName else {
            throw MoonUIError.invalidApp("Expected Element record, got \(runtimeValueDescription(value))")
        }

        switch typeName {
        case "Text":
            let content = stringField(fields, "content") ?? ""
            let style = textStyleField(fields["style"])
            return .text(content: content, style: style)

        case "Button":
            let label = try toLayoutElement(fields["label"] ?? .null)
            return .button(label: label)

        case "Column":
            return .column(
                spacing: floatField(fields, "spacing", default: 0),
                padding: floatField(fields, "padding", default: 0),
                align: alignField(fields["align"]),
                children: try arrayField(fields, "children").map(toLayoutElement)
            )

        case "Row":
            return .row(
                spacing: floatField(fields, "spacing", default: 0),
                padding: floatField(fields, "padding", default: 0),
                align: alignField(fields["align"]),
                children: try arrayField(fields, "children").map(toLayoutElement)
            )

        case "Card":
            return .card(
                padding: floatField(fields, "padding", default: 0),
                child: try toLayoutElement(fields["child"] ?? .null)
            )

        case "Spacer":
            return .spacer

        case "WithPadding":
            let top = floatField(fields, "top", default: 0)
            let right = floatField(fields, "right", default: 0)
            let bottom = floatField(fields, "bottom", default: 0)
            let left = floatField(fields, "left", default: 0)
            let child = try toLayoutElement(fields["child"] ?? .null)
            if top == bottom, left == right, top == left {
                return .padding(all: top, child: child)
            }
            if top == bottom {
                return .paddingXY(horizontal: left, vertical: top, child: child)
            }
            return .padding(all: top, child: child)

        case "WithFrame":
            return .frame(
                width: floatField(fields, "width", default: 0),
                height: floatField(fields, "height", default: 0),
                child: try toLayoutElement(fields["child"] ?? .null)
            )

        case "WithForeground":
            return try toLayoutElement(fields["child"] ?? .null)

        case "Input":
            return .input()

        case "List":
            return .list(
                spacing: 8,
                padding: 0,
                children: try arrayField(fields, "items").map(toLayoutElement)
            )

        default:
            throw MoonUIError.invalidApp("Unsupported Element constructor: \(typeName)")
        }
    }

    static func payload(for value: RuntimeValue) -> ElementPayload {
        guard case .record(let typeName, let fields) = value, let typeName else {
            return ElementPayload()
        }
        switch typeName {
        case "Text":
            return ElementPayload(
                text: stringField(fields, "content"),
                textStyle: textStyleField(fields["style"]),
                foreground: colorField(fields["color"])
            )
        case "Button":
            return ElementPayload(
                onPress: fields["onPress"],
                enabled: boolField(fields, "enabled", default: true)
            )
        case "Input":
            return ElementPayload(
                text: stringField(fields, "value") ?? "",
                placeholder: stringField(fields, "placeholder"),
                onChange: fields["onChange"]
            )
        case "List":
            return ElementPayload(
                onScroll: fields["onScroll"],
                scrollOffset: intField(fields, "scrollOffset", default: 0)
            )
        case "WithForeground":
            var child = payload(for: fields["child"] ?? .null)
            if let color = colorField(fields["color"]) {
                child.foreground = color
            }
            return child
        default:
            return ElementPayload()
        }
    }

    static func elementHash(_ value: RuntimeValue) -> UInt64 {
        var hasher = Hasher()
        hashValue(value, into: &hasher)
        return UInt64(bitPattern: Int64(hasher.finalize()))
    }

    private static func hashValue(_ value: RuntimeValue, into hasher: inout Hasher) {
        switch value {
        case .null: hasher.combine(0)
        case .bool(let b): hasher.combine(1); hasher.combine(b)
        case .int(let n): hasher.combine(2); hasher.combine(n)
        case .double(let d): hasher.combine(3); hasher.combine(d)
        case .string(let s): hasher.combine(4); hasher.combine(s)
        case .symbol(let s): hasher.combine(5); hasher.combine(s)
        case .array(let items):
            hasher.combine(6)
            for item in items { hashValue(item, into: &hasher) }
        case .record(let typeName, let fields):
            hasher.combine(7)
            hasher.combine(typeName)
            for key in fields.keys.sorted() {
                hasher.combine(key)
                hashValue(fields[key] ?? .null, into: &hasher)
            }
        default:
            hasher.combine(8)
            hasher.combine(runtimeValueDescription(value))
        }
    }

    private static func stringField(_ fields: [String: RuntimeValue], _ key: String) -> String? {
        if case .string(let text) = fields[key] { return text }
        return nil
    }

    private static func boolField(_ fields: [String: RuntimeValue], _ key: String, default defaultValue: Bool) -> Bool {
        if case .bool(let value) = fields[key] { return value }
        return defaultValue
    }

    private static func floatField(_ fields: [String: RuntimeValue], _ key: String, default defaultValue: Float) -> Float {
        if case .int(let value) = fields[key] { return Float(value) }
        if case .double(let value) = fields[key] { return Float(value) }
        return defaultValue
    }

    private static func intField(_ fields: [String: RuntimeValue], _ key: String, default defaultValue: Int) -> Int {
        if case .int(let value) = fields[key] { return value }
        return defaultValue
    }

    static func arrayField(_ fields: [String: RuntimeValue], _ key: String) -> [RuntimeValue] {
        if case .array(let items) = fields[key] { return items }
        return []
    }

    private static func alignField(_ value: RuntimeValue?) -> UIAlign {
        guard case .symbol(let name) = value else { return .start }
        switch name {
        case "AlignCenter": return .center
        case "AlignEnd": return .end
        case "AlignStretch": return .stretch
        default: return .start
        }
    }

    private static func textStyleField(_ value: RuntimeValue?) -> UITextStyle {
        guard case .symbol(let name) = value else { return .body }
        switch name {
        case "Title": return .title
        case "Headline": return .headline
        case "Caption": return .caption
        case "Monospace": return .monospace
        default: return .body
        }
    }

    private static func colorField(_ value: RuntimeValue?) -> UIColor? {
        guard case .record(_, let fields) = value else { return nil }
        guard let r = intValue(fields["r"]),
              let g = intValue(fields["g"]),
              let b = intValue(fields["b"]) else { return nil }
        return UIColor(r: UInt8(clamping: r), g: UInt8(clamping: g), b: UInt8(clamping: b))
    }

    private static func intValue(_ value: RuntimeValue?) -> Int? {
        if case .int(let n) = value { return n }
        return nil
    }
}