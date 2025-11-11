//
//  ImageService.swift
//  AtelieArtAgent
//
//  Service for image conversion and manipulation
//

import UIKit
import SwiftUI

class ImageService {
    static let shared = ImageService()
    
    private init() {}
    
    /// Convert UIImage to base64 string (removes data URL prefix)
    func imageToBase64(_ image: UIImage, compressionQuality: CGFloat = 0.8) -> String? {
        guard let imageData = image.jpegData(compressionQuality: compressionQuality) else {
            return nil
        }
        return imageData.base64EncodedString()
    }
    
    /// Resize image to reduce file size
    func resizeImage(_ image: UIImage, maxDimension: CGFloat = 1920) -> UIImage {
        let size = image.size
        
        // If image is already smaller, return as is
        if size.width <= maxDimension && size.height <= maxDimension {
            return image
        }
        
        let ratio = min(maxDimension / size.width, maxDimension / size.height)
        let newSize = CGSize(width: size.width * ratio, height: size.height * ratio)
        
        UIGraphicsBeginImageContextWithOptions(newSize, false, 1.0)
        image.draw(in: CGRect(origin: .zero, size: newSize))
        let resizedImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        return resizedImage ?? image
    }
    
    /// Combine room image and artwork image into a single image
    func combineImages(roomImage: UIImage, artworkImage: UIImage, artworkFrame: CGRect, opacity: CGFloat = 1.0) -> UIImage? {
        let size = roomImage.size
        UIGraphicsBeginImageContextWithOptions(size, false, 0.0)
        
        // Draw room image
        roomImage.draw(in: CGRect(origin: .zero, size: size))
        
        // Draw artwork with opacity
        let context = UIGraphicsGetCurrentContext()
        context?.setAlpha(opacity)
        artworkImage.draw(in: artworkFrame)
        
        let combinedImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        return combinedImage
    }
}

