import Foundation
import MoonRuntime

actor CmdDispatcher {
    private var ctx: RuntimeContext

    init(ctx: RuntimeContext) {
        self.ctx = ctx
    }

    func dispatch(_ cmd: RuntimeValue) async -> RuntimeValue? {
        guard case .record(let typeName, let fields) = cmd, let typeName else {
            if case .symbol(let name) = cmd, name == "NoCmd" { return nil }
            return nil
        }

        switch typeName {
        case "NoCmd":
            return nil
        case "Batch":
            let items = batchItems(fields)
            for item in items {
                if let msg = await dispatch(item) {
                    return msg
                }
            }
            return nil
        case "Delay":
            let ms = intField(fields, "milliseconds") ?? 0
            let onDone = fields["onDone"]
            if ms > 0 {
                try? await Task.sleep(nanoseconds: UInt64(ms) * 1_000_000)
            }
            return onDone
        case "SaveFile":
            return fields["onDone"]
        case "RunAgent", "RunStorm":
            return nil
        default:
            return nil
        }
    }

    private func intField(_ fields: [String: RuntimeValue], _ key: String) -> Int? {
        if case .int(let value) = fields[key] { return value }
        return nil
    }

    private func batchItems(_ fields: [String: RuntimeValue]) -> [RuntimeValue] {
        for value in fields.values {
            if case .array(let items) = value { return items }
        }
        return MoonElementBridge.arrayField(fields, "items")
    }
}