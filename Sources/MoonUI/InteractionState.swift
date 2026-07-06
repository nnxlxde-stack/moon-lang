import Foundation

public struct InteractionState: Sendable {
    public var hoveredNodeID: UInt64?
    public var pressedNodeID: UInt64?

    public init(hoveredNodeID: UInt64? = nil, pressedNodeID: UInt64? = nil) {
        self.hoveredNodeID = hoveredNodeID
        self.pressedNodeID = pressedNodeID
    }
}