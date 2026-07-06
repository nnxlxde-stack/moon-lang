import Foundation

public func gitRemoteURL(host: String, owner: String, repo: String) -> String {
    let normalized = host.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    switch normalized {
    case "github.com":
        return "https://github.com/\(owner)/\(repo).git"
    case "gitlab.com":
        return "https://gitlab.com/\(owner)/\(repo).git"
    case "bitbucket.org":
        return "https://bitbucket.org/\(owner)/\(repo).git"
    default:
        return "https://\(host)/\(owner)/\(repo).git"
    }
}