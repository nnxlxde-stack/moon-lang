#if os(Windows)
import Foundation
import WinSDK
import MoonD2D
import MoonYoga

final class WinD2DRenderBackend: RenderBackend {
    private var context: OpaquePointer?
    private var hwnd: HWND?

    func attach(hwnd: HWND?) {
        self.hwnd = hwnd
        if let context {
            moon_d2d_destroy(context)
            self.context = nil
        }
        guard let hwnd else { return }
        context = moon_d2d_create(
            UnsafeMutableRawPointer(hwnd),
            1,
            1
        )
    }

    deinit {
        if let context {
            moon_d2d_destroy(context)
        }
    }

    func resize(size: UISize) throws {
        guard let context else { return }
        if !moon_d2d_resize(context, UInt32(max(size.width, 1)), UInt32(max(size.height, 1))) {
            throw MoonUIError.renderFailed("D2D resize failed")
        }
    }

    func beginFrame(clear: UIColor) throws {
        guard let context else { return }
        moon_d2d_begin_frame(context, d2dColor(clear))
    }

    func drawRect(_ rect: UIRect, fill: UIColor, radius: Float, border: UIBorder?) {
        guard let context else { return }
        moon_d2d_fill_round_rect(context, d2dRect(rect), radius, d2dColor(fill))
        if let border {
            _ = border
        }
    }

    func drawText(_ text: String, rect: UIRect, style: UITextStyle, color: UIColor) {
        guard let context else { return }
        text.withCString(encodedAs: UTF16.self) { ptr in
            moon_d2d_draw_text(context, ptr, d2dRect(rect), d2dTextStyle(style), d2dColor(color))
        }
    }

    func endFrame() throws {}

    func present() throws {
        guard let context else { return }
        moon_d2d_end_frame(context)
    }

    private func d2dRect(_ rect: UIRect) -> MoonD2DRect {
        MoonD2DRect(x: rect.x, y: rect.y, width: rect.width, height: rect.height)
    }

    private func d2dColor(_ color: UIColor) -> MoonD2DColor {
        MoonD2DColor(
            r: Float(color.r) / 255.0,
            g: Float(color.g) / 255.0,
            b: Float(color.b) / 255.0,
            a: Float(color.a) / 255.0
        )
    }

    private func d2dTextStyle(_ style: UITextStyle) -> MoonD2DTextStyle {
        switch style {
        case .title: return MoonD2DTextStyleTitle
        case .headline: return MoonD2DTextStyleHeadline
        case .body: return MoonD2DTextStyleBody
        case .caption: return MoonD2DTextStyleCaption
        case .monospace: return MoonD2DTextStyleMonospace
        }
    }
}
#endif