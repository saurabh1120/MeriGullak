import api from './axios'

export const fileApi = {
  upload: (file, folder = 'receipts') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}