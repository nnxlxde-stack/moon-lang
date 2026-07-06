import Testing
@testable import MoonUI

@Test func buttonFillReflectsInteractionState() {
    let button = SceneNode(
        id: 42,
        kind: .button,
        bounds: UIRect(x: 0, y: 0, width: 40, height: 30),
        payload: ElementPayload(onPress: .symbol("Increment"))
    )

    let idle = ButtonAppearance.fill(node: button, interaction: InteractionState())
    #expect(idle == UITheme.accent)

    let hovered = ButtonAppearance.fill(
        node: button,
        interaction: InteractionState(hoveredNodeID: 42)
    )
    #expect(hovered == UITheme.accentHover)

    let pressed = ButtonAppearance.fill(
        node: button,
        interaction: InteractionState(pressedNodeID: 42)
    )
    #expect(pressed == UITheme.accentPressed)
}