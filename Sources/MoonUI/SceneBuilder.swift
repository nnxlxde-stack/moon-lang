import Foundation
import MoonRuntime
import MoonYoga

enum SceneBuilder {
    static func build(
        element: RuntimeValue,
        viewportWidth: Float,
        viewportHeight: Float
    ) throws -> SceneNode {
        let layout = try MoonElementBridge.toLayoutElement(element)
        let engine = YogaLayoutEngine()
        let layoutResult = try engine.layout(layout, viewportWidth: viewportWidth, viewportHeight: viewportHeight)
        return attachPayloads(
            element: element,
            layoutNode: layoutResult.root,
            nextID: 1
        )
    }

    private static func attachPayloads(
        element: RuntimeValue,
        layoutNode: LayoutNode,
        nextID: UInt64
    ) -> SceneNode {
        let kind = elementKind(element)
        let node = SceneNode(
            id: nextID,
            kind: kind,
            bounds: UIRect(layoutNode.rect),
            payload: MoonElementBridge.payload(for: element),
            elementHash: MoonElementBridge.elementHash(element)
        )

        let childElements = childElements(element)
        var children: [SceneNode] = []
        children.reserveCapacity(layoutNode.children.count)
        var childID = nextID + 1
        for (index, layoutChild) in layoutNode.children.enumerated() {
            let childElement = index < childElements.count ? childElements[index] : .null
            let built = attachPayloads(element: childElement, layoutNode: layoutChild, nextID: childID)
            children.append(built)
            childID = nextChildID(built, after: childID)
        }
        node.children = children
        return node
    }

    private static func nextChildID(_ node: SceneNode, after id: UInt64) -> UInt64 {
        var maxID = id + 1
        for child in node.children {
            maxID = max(maxID, nextChildID(child, after: maxID))
        }
        return maxID
    }

    private static func elementKind(_ value: RuntimeValue) -> ElementKind {
        guard case .record(let typeName, _) = value, let typeName else { return .unsupported }
        switch typeName {
        case "Text": return .text
        case "Button": return .button
        case "Column": return .column
        case "Row": return .row
        case "Card": return .card
        case "Input": return .input
        case "List": return .list
        case "Spacer": return .spacer
        case "WithPadding", "WithFrame", "WithForeground": return .padding
        default: return .unsupported
        }
    }

    private static func childElements(_ value: RuntimeValue) -> [RuntimeValue] {
        guard case .record(let typeName, let fields) = value, let typeName else { return [] }
        switch typeName {
        case "Column", "Row", "List":
            return MoonElementBridge.arrayField(fields, fieldsKey(for: typeName))
        case "Button":
            if let label = fields["label"] { return [label] }
            return []
        case "Card", "WithPadding", "WithFrame", "WithForeground":
            if let child = fields["child"] { return [child] }
            return []
        default:
            return []
        }
    }

    private static func fieldsKey(for typeName: String) -> String {
        switch typeName {
        case "List": return "items"
        default: return "children"
        }
    }
}