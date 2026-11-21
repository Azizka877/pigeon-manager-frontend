// ─────────────────────────────────────────────────────────────────────────────
// lib/pigeon-cage-images.ts — Banque de VRAIES PHOTOS de pigeons pour la volière.
// Les PNG détourés vivent dans public/ ; chaque pigeon reçoit une image STABLE
// (hash FNV-1a de son id — le même pigeon garde toujours la même photo), avec
// un choix adapté au sexe : femelles sur la banque fauve, mâles sur les gris.
// Les poses de vol servent au pigeon qui atterrit sur le faîte des cages.
//
// AJOUTER VOS PROPREES PHOTOS : déposez des PNG détourés dans public/, puis
// ajoutez une entrée dans BANQUE_PERCHOIR_M / BANQUE_PERCHOIR_F / BANQUE_VOL
// avec son sens du regard (`face`) et son ratio largeur/hauteur.
// ─────────────────────────────────────────────────────────────────────────────

import type { PhotoPigeon } from '@/lib/cage-art'

// ── Banques (assets réels dans public/) ─────────────────────────────────────
export const BANQUE_PERCHOIR_M: PhotoPigeon[] = [
  { href: '/pigeon-perche.png',   face: 'gauche', ratio: 1.01 }, // bleu-gris barré, regard à gauche
  { href: '/pigeon-perche-2.png', face: 'droite', ratio: 0.89 }, // bleu-gris barré, regard à droite
  { href: '/pigeon-perche-4.png', face: 'droite', ratio: 1.0  }, // foncé checké, œil cerclé
]

export const BANQUE_PERCHOIR_F: PhotoPigeon[] = [
  { href: '/pigeon-perche-3.png', face: 'gauche', ratio: 1.05 }, // fauve, bague d'élevage visible
  { href: '/pigeon-perche-2.png', face: 'droite', ratio: 0.89 }, // bleu-gris barré
]

export const BANQUE_VOL: PhotoPigeon[] = [
  { href: '/pigeon-vol.png',   face: 'droite', ratio: 0.9  }, // ailes déployées
  { href: '/pigeon-vol-a.png', face: 'droite', ratio: 0.82 }, // atterrissage, serres tendues
  { href: '/pigeon-vol-b.png', face: 'droite', ratio: 0.82 }, // freinage, serres basses
]

// ── Hash FNV-1a (identique à cage-art.ts) ───────────────────────────────────
function hashId(s: string): number {
  let h = 0x811c9dc5
  for (const c of s) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

function choisir(banque: PhotoPigeon[], id: string, decalage = 0): PhotoPigeon {
  if (banque.length === 0) {
    return { href: '/pigeon-perche.png', face: 'gauche', ratio: 1.01 }
  }
  return banque[(hashId(id) + decalage) % banque.length]
}

// ── Sélections stables par pigeon ───────────────────────────────────────────

/** Photo du pigeon seul (banque selon le sexe, stable par id) */
export function photoPigeonSeul(id?: string | null, sexe?: 'M' | 'F'): PhotoPigeon | null {
  if (!id) return null
  return choisir(sexe === 'F' ? BANQUE_PERCHOIR_F : BANQUE_PERCHOIR_M, id)
}

/**
 * Photos d'un couple : mâle et femelle de banques différentes, et si le hasard
 * donnait la même image aux deux, on décale le mâle d'un cran (jamais deux
 * clones identiques face à face).
 */
export function photosPigeonCouple(
  idMale?: string | null,
  idFemelle?: string | null,
): { male: PhotoPigeon | null; femelle: PhotoPigeon | null } {
  if (!idMale && !idFemelle) return { male: null, femelle: null }
  const femelle = idFemelle ? choisir(BANQUE_PERCHOIR_F, idFemelle) : null
  const maleBrut = idMale ? choisir(BANQUE_PERCHOIR_M, idMale) : null
  let male = maleBrut
  if (male && femelle && idMale && male.href === femelle.href) {
    male = choisir(BANQUE_PERCHOIR_M, idMale, 1)
  }
  return { male, femelle }
}

/** Photo du pigeon en vol qui atterrit sur le faîte (stable par cage) */
export function photoPigeonToit(idCage?: string | null): PhotoPigeon | null {
  if (!idCage) return null
  return choisir(BANQUE_VOL, `toit-${idCage}`)
}