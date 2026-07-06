// swift-tools-version: 6.0
import Foundation
import PackageDescription

private let packageDir = URL(fileURLWithPath: #filePath).deletingLastPathComponent().path
private let yogaInclude = "\(packageDir)/Vendor/yoga"


let package = Package(
    name: "moon",
    platforms: [
        .macOS(.v14),
        .iOS(.v17),
        .tvOS(.v17),
        .watchOS(.v10),
        .visionOS(.v1),
    ],
    products: [
        .executable(name: "moon", targets: ["MoonCLI"]),
        .library(name: "MoonAST", targets: ["MoonAST"]),
    ],
    targets: [
        .target(name: "MoonAST"),
        .target(name: "MoonTypes", dependencies: ["MoonAST"]),
        .target(name: "MoonLexer", dependencies: ["MoonAST"]),
        .target(name: "MoonParser", dependencies: ["MoonAST", "MoonLexer"]),
        .target(name: "MoonMoonfile"),
        .target(name: "MoonResolver", dependencies: ["MoonAST", "MoonParser", "MoonTypes", "MoonMoonfile"]),
        .target(name: "MoonTypechecker", dependencies: ["MoonAST", "MoonParser", "MoonTypes", "MoonResolver"]),
        .target(name: "MoonSchemaCompiler", dependencies: ["MoonAST"]),
        .target(name: "MoonPlanner", dependencies: ["MoonAST"]),
        .target(name: "MoonBuild", dependencies: [
            "MoonAST",
            "MoonParser",
            "MoonTypechecker",
            "MoonPlanner",
            "MoonSchemaCompiler",
            "MoonResolver",
            "MoonMoonfile",
        ]),
        .target(name: "MoonRegistry", dependencies: ["MoonMoonfile"]),
        .target(name: "MoonFormatter", dependencies: ["MoonAST", "MoonParser"]),
        .target(name: "MoonLSP", dependencies: [
            "MoonAST",
            "MoonLexer",
            "MoonParser",
            "MoonTypechecker",
            "MoonResolver",
            "MoonFormatter",
            "MoonMoonfile",
            "MoonPrompt",
            "MoonSchemaCompiler",
        ]),
        .target(name: "MoonPrompt", dependencies: ["MoonAST", "MoonSchemaCompiler"]),
        .target(name: "MoonRuntime", dependencies: [
            "MoonAST",
            "MoonParser",
            "MoonResolver",
            "MoonPlanner",
            "MoonPrompt",
            "MoonSchemaCompiler",
            "MoonMoonfile",
        ]),
        .target(
            name: "YogaCore",
            path: "Vendor/yoga/yoga",
            exclude: ["CMakeLists.txt", "module.modulemap.disabled"],
            cxxSettings: [
                .headerSearchPath("../"),
                .define("YOGA_EXPORT=", to: "YogaCore"),
            ]
        ),
        .target(
            name: "YogaLink",
            dependencies: ["YogaCore"],
            path: "Sources/YogaLink"
        ),
        .target(
            name: "MoonYoga",
            dependencies: ["YogaLink"],
            path: "Sources/MoonYoga",
            exclude: ["CAPI"],
            swiftSettings: [
                .unsafeFlags(["-Xcc", "-fmodule-map-file=\(packageDir)/Sources/MoonYoga/CAPI/module.modulemap"]),
                .unsafeFlags(["-Xcc", "-I\(yogaInclude)"]),
            ]
        ),
        .target(
            name: "MoonD2D",
            path: "Sources/MoonD2D",
            exclude: ["CAPI"],
            publicHeadersPath: "include",
            linkerSettings: [
                .linkedLibrary("d2d1", .when(platforms: [.windows])),
                .linkedLibrary("dwrite", .when(platforms: [.windows])),
                .linkedLibrary("ole32", .when(platforms: [.windows])),
            ]
        ),
        .target(
            name: "MoonUI",
            dependencies: ["MoonYoga", "MoonRuntime", "MoonD2D"],
            path: "Sources/MoonUI",
            swiftSettings: [
                .unsafeFlags(["-Xcc", "-fmodule-map-file=\(packageDir)/Sources/MoonYoga/CAPI/module.modulemap"]),
                .unsafeFlags(["-Xcc", "-I\(yogaInclude)"]),
                .unsafeFlags(["-Xfrontend", "-strict-concurrency=minimal"]),
            ],
            linkerSettings: [
                .linkedLibrary("User32", .when(platforms: [.windows])),
            ]
        ),
        .executableTarget(
            name: "MoonCLI",
            dependencies: [
                "MoonAST",
                "MoonLexer",
                "MoonParser",
                "MoonPlanner",
                "MoonTypechecker",
                "MoonMoonfile",
                "MoonBuild",
                "MoonRegistry",
                "MoonFormatter",
                "MoonLSP",
                "MoonRuntime",
                "MoonUI",
            ],
            swiftSettings: [
                .unsafeFlags(["-Xcc", "-fmodule-map-file=\(packageDir)/Sources/MoonYoga/CAPI/module.modulemap"]),
                .unsafeFlags(["-Xcc", "-I\(yogaInclude)"]),
            ]
        ),
        .testTarget(name: "MoonASTTests", dependencies: ["MoonAST"]),
        .testTarget(
            name: "MoonUITests",
            dependencies: ["MoonUI"],
            swiftSettings: [
                .unsafeFlags(["-Xcc", "-fmodule-map-file=\(packageDir)/Sources/MoonYoga/CAPI/module.modulemap"]),
                .unsafeFlags(["-Xcc", "-I\(yogaInclude)"]),
            ]
        ),
        .testTarget(
            name: "MoonYogaTests",
            dependencies: ["MoonYoga"],
            swiftSettings: [
                .unsafeFlags(["-Xcc", "-fmodule-map-file=\(packageDir)/Sources/MoonYoga/CAPI/module.modulemap"]),
                .unsafeFlags(["-Xcc", "-I\(yogaInclude)"]),
            ]
        ),
        .testTarget(name: "MoonToolchainTests", dependencies: [
            "MoonLexer", "MoonParser", "MoonTypechecker", "MoonResolver",
            "MoonMoonfile", "MoonPlanner", "MoonRuntime", "MoonBuild", "MoonSchemaCompiler",
            "MoonRegistry",
            "MoonFormatter",
            "MoonLSP",
            "MoonPrompt",
            "MoonYoga",
        ]),
    ],
    cxxLanguageStandard: .cxx20
)