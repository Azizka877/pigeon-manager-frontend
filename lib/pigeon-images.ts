// lib/pigeon-images.ts

// Images locales de pigeons dans /public/
const LOCAL_PIGEON_IMAGES = [
  '/close-up-pigeon-looking-camera.jpg',
  '/images.webp',
  '/images (1).webp',
  '/portrait-adorable-pigeon-its-reflection-puddle.jpg',
  '/vertical-shot-pigeon-perched-metallic-tube.jpg',
]

// Fonction pour choisir une image stable basée sur l'ID du pigeon
export function getPigeonImage(pigeonId: string, sexe: 'M' | 'F'): string {
  // Utiliser le hash de l'ID pour choisir toujours la même image pour le même pigeon
  const hash = pigeonId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // Séparer les images par sexe (alternance basée sur le hash)
  const images = sexe === 'M' 
    ? LOCAL_PIGEON_IMAGES 
    : [...LOCAL_PIGEON_IMAGES].reverse() // Inverser pour la femelle
  
  return images[hash % images.length]
}

// Fallback si besoin d'une image spécifique
export function getPigeonImageByIndex(index: number): string {
  return LOCAL_PIGEON_IMAGES[index % LOCAL_PIGEON_IMAGES.length]
}