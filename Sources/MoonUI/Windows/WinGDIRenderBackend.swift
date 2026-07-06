#if os(Windows)
import Foundation
import WinSDK
import MoonYoga

final class WinGDIRenderBackend: RenderBackend {
    private var hwnd: HWND?
    private var size = UISize(width: 0, height: 0)
    private var backBuffer: HDC?
    private var bitmap: HBITMAP?
    private var memDC: HDC?

    func attach(hwnd: HWND?) {
        self.hwnd = hwnd
        resetBuffer()
    }

    func resize(size: UISize) throws {
        self.size = size
        resetBuffer()
    }

    func beginFrame(clear: UIColor) throws {
        guard let memDC else { return }
        let brush = CreateSolidBrush(COLORREF(rgb(clear)))
        var rect = RECT(left: 0, top: 0, right: LONG(size.width), bottom: LONG(size.height))
        FillRect(memDC, &rect, brush)
        DeleteObject(brush)
    }

    func drawRect(_ rect: UIRect, fill: UIColor, radius: Float, border: UIBorder?) {
        guard let memDC else { return }
        _ = radius
        let brush = CreateSolidBrush(COLORREF(rgb(fill)))
        var r = RECT(
            left: LONG(rect.x),
            top: LONG(rect.y),
            right: LONG(rect.right),
            bottom: LONG(rect.bottom)
        )
        FillRect(memDC, &r, brush)
        DeleteObject(brush)

        if let border {
            let pen = CreatePen(PS_SOLID, Int32(border.width), COLORREF(rgb(border.color)))
            let oldPen = SelectObject(memDC, pen)
            let oldBrush = SelectObject(memDC, GetStockObject(HOLLOW_BRUSH))
            Rectangle(memDC, r.left, r.top, r.right, r.bottom)
            SelectObject(memDC, oldBrush)
            SelectObject(memDC, oldPen)
            DeleteObject(pen)
        }
    }

    func drawText(_ text: String, rect: UIRect, style: UITextStyle, color: UIColor) {
        guard let memDC else { return }
        _ = style
        SetBkMode(memDC, TRANSPARENT)
        SetTextColor(memDC, COLORREF(rgb(color)))
        var r = RECT(
            left: LONG(rect.x + 4),
            top: LONG(rect.y + 2),
            right: LONG(rect.right - 4),
            bottom: LONG(rect.bottom - 2)
        )
        text.withCString(encodedAs: UTF16.self) { ptr in
            DrawTextW(memDC, ptr, -1, &r, UINT(DT_LEFT | DT_VCENTER | DT_SINGLELINE))
        }
    }

    func endFrame() throws {}

    func present() throws {
        guard let hwnd, let memDC, let backBuffer else { return }
        var client = RECT()
        GetClientRect(hwnd, &client)
        BitBlt(
            backBuffer,
            0,
            0,
            client.right - client.left,
            client.bottom - client.top,
            memDC,
            0,
            0,
            DWORD(SRCCOPY)
        )
    }

    private func resetBuffer() {
        guard let hwnd else { return }
        if let bitmap { DeleteObject(bitmap) }
        if let memDC { DeleteDC(memDC) }

        backBuffer = GetDC(hwnd)
        memDC = CreateCompatibleDC(backBuffer)
        let width = max(LONG(size.width), 1)
        let height = max(LONG(size.height), 1)
        bitmap = CreateCompatibleBitmap(backBuffer, width, height)
        if let memDC, let bitmap {
            SelectObject(memDC, bitmap)
        }
    }

    private func rgb(_ color: UIColor) -> UInt32 {
        UInt32(color.r) | (UInt32(color.g) << 8) | (UInt32(color.b) << 16)
    }
}
#endif