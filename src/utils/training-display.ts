import type { PracticeBooking, TrainingProject } from '~/types/driving-school'
import type { Ref } from 'vue'
import { PRACTICE_PHOTO } from '~/utils/back-audit'

export function useProjectLookup(projects: Ref<TrainingProject[]>) {
  function projectOf(id: number) {
    return projects.value.find(p => p.id === id)
  }
  return { projectOf }
}

export function bookingPhoto(project?: TrainingProject) {
  return project?.practice_photo || PRACTICE_PHOTO
}
