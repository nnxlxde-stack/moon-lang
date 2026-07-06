#if os(Windows)
import Foundation
import WinSDK

private let IDC_ARROW: Int = 32512

final class WinWindow {
    private(set) var hwnd: HWND?
    private let className = "MoonUIWindow"
    nonisolated(unsafe) private static var activeWindow: WinWindow?

    var onPaint: (() -> Void)?
    var onResize: ((Int32, Int32) -> Void)?
    var onMouseMove: ((Float, Float) -> Void)?
    var onMouseDown: ((Float, Float) -> Void)?
    var onClick: ((Float, Float) -> Void)?
    var onMouseWheel: ((Int, Float, Float) -> Void)?
    var onKeyChar: ((UInt16) -> Void)?
    var onKeyDown: ((Int32, Bool) -> Void)?
    var onClose: (() -> Void)?

    func create(title: String, width: Int32, height: Int32) throws {
        let hInstance = GetModuleHandleW(nil)
        var classNameW = utf16(className)
        var wc = WNDCLASSEXW(
            cbSize: UINT(MemoryLayout<WNDCLASSEXW>.size),
            style: 0,
            lpfnWndProc: { hwnd, msg, wParam, lParam in
                WinWindow.windowProc(hwnd: hwnd, msg: msg, wParam: wParam, lParam: lParam)
            },
            cbClsExtra: 0,
            cbWndExtra: 0,
            hInstance: hInstance,
            hIcon: nil,
            hCursor: LoadCursorW(nil, UnsafePointer(bitPattern: IDC_ARROW)),
            hbrBackground: HBRUSH(bitPattern: Int(COLOR_WINDOW + 1)),
            lpszMenuName: nil,
            lpszClassName: &classNameW,
            hIconSm: nil
        )
        RegisterClassExW(&wc)

        var titleW = utf16(title)
        let created = CreateWindowExW(
            0,
            &classNameW,
            &titleW,
            UINT(WS_OVERLAPPEDWINDOW),
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            width,
            height,
            nil,
            nil,
            hInstance,
            nil
        )
        guard let created else {
            throw MoonUIError.windowCreationFailed
        }
        hwnd = created
        WinWindow.activeWindow = self
        ShowWindow(created, SW_SHOW)
        UpdateWindow(created)
    }

    func pumpOnce() -> Bool {
        var msg = MSG()
        if PeekMessageW(&msg, nil, 0, 0, UINT(PM_REMOVE)) {
            if msg.message == UINT(WM_QUIT) {
                return false
            }
            TranslateMessage(&msg)
            DispatchMessageW(&msg)
        }
        return true
    }

    func runLoop() {
        var msg = MSG()
        while GetMessageW(&msg, nil, 0, 0) {
            TranslateMessage(&msg)
            DispatchMessageW(&msg)
        }
    }

    func clientSize() -> (Float, Float) {
        guard let hwnd else { return (0, 0) }
        var rect = RECT()
        GetClientRect(hwnd, &rect)
        return (Float(rect.right - rect.left), Float(rect.bottom - rect.top))
    }

    func invalidate() {
        guard let hwnd else { return }
        InvalidateRect(hwnd, nil, false)
    }

    private static func windowProc(hwnd: HWND?, msg: UINT, wParam: WPARAM, lParam: LPARAM) -> LRESULT {
        guard let window = activeWindow else {
            return DefWindowProcW(hwnd, msg, wParam, lParam)
        }

        switch msg {
        case UINT(WM_DESTROY):
            window.onClose?()
            PostQuitMessage(0)
            return 0
        case UINT(WM_SIZE):
            let width = Int32(lParam & 0xFFFF)
            let height = Int32((lParam >> 16) & 0xFFFF)
            window.onResize?(width, height)
            return 0
        case UINT(WM_PAINT):
            window.onPaint?()
            var ps = PAINTSTRUCT()
            let hdc = BeginPaint(hwnd, &ps)
            EndPaint(hwnd, &ps)
            _ = hdc
            return 0
        case UINT(WM_MOUSEMOVE):
            let x = Float(Int16(lParam & 0xFFFF))
            let y = Float(Int16((lParam >> 16) & 0xFFFF))
            window.onMouseMove?(x, y)
            return 0
        case UINT(WM_LBUTTONDOWN):
            let x = Float(Int16(lParam & 0xFFFF))
            let y = Float(Int16((lParam >> 16) & 0xFFFF))
            window.onMouseDown?(x, y)
            return 0
        case UINT(WM_LBUTTONUP):
            let x = Float(Int16(lParam & 0xFFFF))
            let y = Float(Int16((lParam >> 16) & 0xFFFF))
            window.onClick?(x, y)
            return 0
        case UINT(WM_MOUSEWHEEL):
            let delta = Int(Int16((UInt32(lParam) >> 16) & 0xFFFF))
            var point = POINT(x: LONG(lParam & 0xFFFF), y: LONG((lParam >> 16) & 0xFFFF))
            if let hwnd {
                ScreenToClient(hwnd, &point)
            }
            window.onMouseWheel?(delta, Float(point.x), Float(point.y))
            return 0
        case UINT(WM_CHAR):
            window.onKeyChar?(UInt16(wParam))
            return 0
        case UINT(WM_KEYDOWN):
            let controlPressed = (Int32(GetKeyState(Int32(VK_CONTROL))) & 0x8000) != 0
            window.onKeyDown?(Int32(wParam), controlPressed)
            return 0
        default:
            return DefWindowProcW(hwnd, msg, wParam, lParam)
        }
    }

    private func utf16(_ text: String) -> [UInt16] {
        var buffer = Array(text.utf16)
        buffer.append(0)
        return buffer
    }
}
#endif