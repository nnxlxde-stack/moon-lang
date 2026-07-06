import Foundation
import MoonYoga

public protocol RenderBackend: AnyObject {
    func resize(size: UISize) throws
    func beginFrame(clear: UIColor) throws
    func drawRect(_ rect: UIRect, fill: UIColor, radius: Float, border: UIBorder?)
    func drawText(_ text: String, rect: UIRect, style: UITextStyle, color: UIColor)
    func endFrame() throws
    func present() throws
}