import Foundation

public final class UIRuntimeLoop: @unchecked Sendable {
    private let session: MoonAppSession
    private var scene: SceneNode?
    private var viewport = UIRect(x: 0, y: 0, width: 480, height: 360)

    public init(session: MoonAppSession) {
        self.session = session
        viewport = UIRect(
            x: 0,
            y: 0,
            width: Float(session.options.width),
            height: Float(session.options.height)
        )
    }

    public func resize(width: Float, height: Float) {
        viewport = UIRect(x: 0, y: 0, width: width, height: height)
        scene = nil
    }

    public func rebuildScene() async throws -> SceneDiffResult {
        let next = try await session.buildScene(width: viewport.width, height: viewport.height)
        let diff = SceneDiff.apply(previous: scene, next: next, viewport: viewport)
        scene = diff.root
        return diff
    }

    public func render(backend: RenderBackend) async throws {
        if scene == nil {
            _ = try await rebuildScene()
        }
        guard let scene else { return }
        try SceneRenderer.render(scene, backend: backend)
    }

    public func handleClick(x: Float, y: Float) async throws -> Bool {
        guard let currentScene = scene else { return false }
        guard let hit = HitTest.locate(currentScene, x: x, y: y),
              let onPress = hit.node.payload.onPress,
              hit.node.payload.enabled else {
            return false
        }
        try await session.dispatchMessage(onPress)
        scene = nil
        return true
    }
}