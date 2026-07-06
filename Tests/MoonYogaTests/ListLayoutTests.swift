import Testing
@testable import MoonYoga

@Test func yogaListGrowsInColumn() throws {
    let engine = YogaLayoutEngine()
    let tree: UILayoutElement = .column(
        spacing: 8,
        padding: 0,
        align: .stretch,
        children: [
            .text(content: "Header", style: .headline),
            .list(
                spacing: 8,
                padding: 0,
                children: [
                    .card(padding: 12, child: .text(content: "One", style: .body)),
                    .card(padding: 12, child: .text(content: "Two", style: .body)),
                ]
            ),
        ]
    )

    let result = try engine.layout(tree, viewportWidth: 320, viewportHeight: 400)
    let column = result.root.children[0]
    #expect(column.children.count == 2)
    let list = column.children[1]
    #expect(list.rect.height > 80)
}