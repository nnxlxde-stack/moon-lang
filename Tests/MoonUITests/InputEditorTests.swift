import Testing
@testable import MoonUI

@Test func inputEditorInsertsAndDeletes() {
    let inserted = InputEditor.insert("bc", into: "a", at: 1)
    #expect(inserted.0 == "abc")
    #expect(inserted.1 == 3)

    let deleted = InputEditor.deleteBackward("abc", cursor: 2, selection: nil)
    #expect(deleted.0 == "ac")
    #expect(deleted.1 == 1)
}

@Test func inputEditorReplacesSelection() {
    let removed = InputEditor.deleteBackward("hello", cursor: 4, selection: 1..<4)
    #expect(removed.0 == "ho")
    #expect(removed.1 == 1)
}