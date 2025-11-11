//
//  AtelieArtAgentApp.swift
//  AtelieArtAgent
//
//  Created on iOS Art Agent App
//

import SwiftUI

@main
struct AtelieArtAgentApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        NavigationView {
            SearchView()
        }
    }
}

