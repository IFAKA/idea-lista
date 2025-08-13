import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique ID with consistent length
export function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  const id = `${timestamp}-${random}`.padEnd(16, '0')
  return id.substring(0, 16) // Ensure exactly 16 characters
}

// Generate ID based on existing properties to ensure uniqueness
export function generateUniqueId(existingIds: string[] = []): string {
  let attempts = 0
  const maxAttempts = 100
  
  while (attempts < maxAttempts) {
    const id = generateId()
    if (!existingIds.includes(id)) {
      // Debug: Log when we find a unique ID
      if (existingIds.length > 0) {
        console.log(`✅ Generated unique ID: ${id} (attempt ${attempts + 1})`)
      }
      return id
    }
    attempts++
  }
  
  // Fallback: use timestamp with microsecond precision
  const timestamp = Date.now()
  const micro = performance.now() % 1000
  const fallbackId = `${timestamp}-${Math.floor(micro)}`.padEnd(16, '0').substring(0, 16)
  console.warn(`⚠️ Using fallback ID generation: ${fallbackId}`)
  return fallbackId
}

// Debug function to check ID uniqueness
export function validateUniqueIds(ids: string[]): { isUnique: boolean; duplicates: string[] } {
  const seen = new Set<string>()
  const duplicates: string[] = []
  
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.push(id)
    } else {
      seen.add(id)
    }
  }
  
  return {
    isUnique: duplicates.length === 0,
    duplicates
  }
}
