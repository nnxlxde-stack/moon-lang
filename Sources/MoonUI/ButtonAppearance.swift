import Foundation

enum ButtonAppearance {
    static func fill(node: SceneNode, interaction: InteractionState) -> UIColor {
        guard node.payload.enabled else {
            return UITheme.textMuted
        }
        if interaction.pressedNodeID == node.id {
            return UITheme.accentPressed
        }
        if interaction.hoveredNodeID == node.id {
            return UITheme.accentHover
        }
        return UITheme.accent
    }
}