import Testing
import MoonYoga
@testable import MoonUI

@Test func listScrollClampsOffset() {
    let clamped = ListScroll.clampedOffset(900, viewportHeight: 200, contentHeight: 900)
    #expect(clamped == 700)
}

@Test func listScrollComputesContentHeight() {
    let list = SceneNode(
        id: 1,
        kind: .list,
        bounds: UIRect(x: 0, y: 0, width: 300, height: 200),
        children: [
            SceneNode(id: 2, kind: .card, bounds: UIRect(x: 0, y: 0, width: 300, height: 40)),
            SceneNode(id: 3, kind: .card, bounds: UIRect(x: 0, y: 48, width: 300, height: 40)),
        ]
    )
    #expect(ListScroll.contentHeight(for: list) == 88)
}

@Test func listRendersThirtyItemsUnderFrameBudget() throws {
    var children: [SceneNode] = []
    var y: Float = 0
    for index in 0..<30 {
        children.append(
            SceneNode(
                id: UInt64(index + 2),
                kind: .card,
                bounds: UIRect(x: 0, y: y, width: 300, height: 48),
                payload: ElementPayload(text: "PR #\(index + 1)")
            )
        )
        y += 56
    }

    let list = SceneNode(
        id: 1,
        kind: .list,
        bounds: UIRect(x: 0, y: 40, width: 300, height: 220),
        payload: ElementPayload(scrollOffset: 120),
        children: children
    )

    let backend = CountingRenderBackend()
    let start = ContinuousClock.now
    for _ in 0..<60 {
        try SceneRenderer.render(list, backend: backend)
    }
    let elapsed = start.duration(to: .now)
    let perFrameMs = Double(elapsed.components.seconds) * 1000.0 / 60.0
        + Double(elapsed.components.attoseconds) / 1_000_000_000_000_000.0 / 60.0

    #expect(backend.drawCalls > 0)
    #expect(perFrameMs < 16.0)
}

private final class CountingRenderBackend: RenderBackend {
    var drawCalls = 0

    func resize(size: UISize) throws {}
    func beginFrame(clear: UIColor) throws {}
    func drawRect(_ rect: UIRect, fill: UIColor, radius: Float, border: UIBorder?) { drawCalls += 1 }
    func drawText(_ text: String, rect: UIRect, style: UITextStyle, color: UIColor) { drawCalls += 1 }
    func endFrame() throws {}
    func present() throws {}
}