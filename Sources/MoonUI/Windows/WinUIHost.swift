#if os(Windows)
import Foundation

private final class HostController: @unchecked Sendable {
    let loop: UIRuntimeLoop
    let backend: WinGDIRenderBackend
    let window: WinWindow

    init(session: MoonAppSession) {
        self.loop = UIRuntimeLoop(session: session)
        self.backend = WinGDIRenderBackend()
        self.window = WinWindow()
    }

    func paint() {
        do {
            let frame = try runSync { try await self.loop.rebuildScene() }
            _ = frame
            try runSync { try await self.loop.render(backend: self.backend) }
            try backend.present()
        } catch {
            fputs("moon-ui: \(error)\n", stderr)
        }
    }

    func click(x: Float, y: Float) {
        do {
            let changed = try runSync { try await self.loop.handleClick(x: x, y: y) }
            if changed {
                window.invalidate()
            }
        } catch {
            fputs("moon-ui: \(error)\n", stderr)
        }
    }

    private func runSync<T: Sendable>(_ work: @Sendable @escaping () async throws -> T) throws -> T {
        let semaphore = DispatchSemaphore(value: 0)
        nonisolated(unsafe) var result: Result<T, Error>?
        Task {
            do {
                result = .success(try await work())
            } catch {
                result = .failure(error)
            }
            semaphore.signal()
        }
        semaphore.wait()
        switch result {
        case .success(let value): return value
        case .failure(let error): throw error
        case .none: throw MoonUIError.renderFailed("async operation failed")
        }
    }
}

enum WinUIHost {
    static func run(_ session: MoonAppSession) throws {
        let controller = HostController(session: session)

        try controller.window.create(
            title: session.options.title,
            width: session.options.width,
            height: session.options.height
        )

        let (clientW, clientH) = controller.window.clientSize()
        controller.backend.attach(hwnd: controller.window.hwnd)
        controller.loop.resize(width: clientW, height: clientH)
        try controller.backend.resize(size: UISize(width: clientW, height: clientH))

        controller.window.onResize = { width, height in
            controller.loop.resize(width: Float(width), height: Float(height))
            try? controller.backend.resize(size: UISize(width: Float(width), height: Float(height)))
            controller.window.invalidate()
        }

        controller.window.onPaint = {
            controller.paint()
        }

        controller.window.onClick = { x, y in
            controller.click(x: x, y: y)
        }

        controller.window.onClose = {}
        controller.window.invalidate()
        controller.window.runLoop()
    }
}
#endif