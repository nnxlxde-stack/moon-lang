import Testing
import MoonRuntime
@testable import MoonUI

@Test func sceneDiffMarksChangedBounds() {
    let previous = SceneNode(
        id: 1,
        kind: .text,
        bounds: UIRect(x: 0, y: 0, width: 10, height: 10),
        payload: ElementPayload(text: "a"),
        elementHash: 1
    )
    let next = SceneNode(
        id: 1,
        kind: .text,
        bounds: UIRect(x: 0, y: 0, width: 20, height: 10),
        payload: ElementPayload(text: "ab"),
        elementHash: 2
    )
    let viewport = UIRect(x: 0, y: 0, width: 100, height: 100)
    let diff = SceneDiff.apply(previous: previous, next: next, viewport: viewport)
    #expect(diff.dirtyRects.count >= 2)
    #expect(next.dirty)
}

@Test func hitTestFindsTopMostButton() {
    let button = SceneNode(
        id: 2,
        kind: .button,
        bounds: UIRect(x: 10, y: 10, width: 40, height: 30),
        payload: ElementPayload(onPress: .symbol("Increment"))
    )
    let root = SceneNode(
        id: 1,
        kind: .column,
        bounds: UIRect(x: 0, y: 0, width: 100, height: 100),
        children: [button]
    )
    let hit = HitTest.locate(root, x: 20, y: 20)
    #expect(hit?.node.kind == .button)
}