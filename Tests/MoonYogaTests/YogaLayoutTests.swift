import Testing
@testable import MoonYoga

private func approx(_ value: Float, _ expected: Float, tolerance: Float = 0.5) -> Bool {
    abs(value - expected) <= tolerance
}

private func rectApprox(_ rect: LayoutRect, x: Float, y: Float, width: Float, height: Float) -> Bool {
    approx(rect.x, x) && approx(rect.y, y) && approx(rect.width, width) && approx(rect.height, height)
}

@Test func yogaColumnRowTextLayout() throws {
    let engine = YogaLayoutEngine()
    let tree: UILayoutElement = .column(
        spacing: 8,
        padding: 16,
        align: .start,
        children: [
            .row(
                spacing: 12,
                padding: 0,
                align: .center,
                children: [
                    .text(content: "A", style: .body),
                    .text(content: "B", style: .body),
                ]
            ),
            .text(content: "Footer", style: .caption),
        ]
    )

    let result = try engine.layout(tree, viewportWidth: 320, viewportHeight: 240)
    #expect(approx(result.root.rect.width, 320))
    #expect(approx(result.root.rect.height, 240))

    let column = result.root.children[0]
    #expect(column.children.count == 2)

    let row = column.children[0]
    #expect(row.children.count == 2)
    #expect(rectApprox(row.children[0].rect, x: 16, y: 16, width: 8, height: 20))
    #expect(rectApprox(row.children[1].rect, x: 36, y: 16, width: 8, height: 20))

    let footer = column.children[1]
    #expect(rectApprox(footer.rect, x: 16, y: 44, width: 42, height: 16))
}

@Test func yogaCounterLikeLayout() throws {
    let engine = YogaLayoutEngine()
    let tree: UILayoutElement = .padding(
        all: 24,
        child: .column(
            spacing: 16,
            padding: 0,
            align: .center,
            children: [
                .text(content: "0", style: .title),
                .row(
                    spacing: 12,
                    padding: 0,
                    align: .center,
                    children: [
                        .button(label: .text(content: "-", style: .body)),
                        .button(label: .text(content: "+", style: .body)),
                    ]
                ),
            ]
        )
    )

    let result = try engine.layout(tree, viewportWidth: 400, viewportHeight: 300)
    let padded = result.root.children[0]
    let column = padded.children[0]
    #expect(column.children.count == 2)

    let title = column.children[0]
    #expect(rectApprox(title.rect, x: 194, y: 24, width: 12, height: 32))

    let row = column.children[1]
    #expect(row.children.count == 2)
    #expect(row.children[0].rect.height >= 36)
    #expect(row.children[1].rect.height >= 36)
    #expect(row.children[1].rect.x > row.children[0].rect.x)
}

@Test func yogaNestedArrowTupleTypeRegression() throws {
    let engine = YogaLayoutEngine()
    let tree: UILayoutElement = .column(
        spacing: 0,
        padding: 0,
        align: .stretch,
        children: [
            .spacer,
            .text(content: "ok", style: .body),
        ]
    )
    let result = try engine.layout(tree, viewportWidth: 100, viewportHeight: 100)
    #expect(result.root.rect.width == 100)
    #expect(result.root.children[0].children[1].rect.height == 20)
}