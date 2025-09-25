/**
 * FileService - S3 파일 업로드/조회 서비스
 * 
 * 사용 예시:
 * 
 * 1. Import 방법:
 *    import fileService from '../services/fileService';
 * 
 * 2. React 컴포넌트에서 사용:
 *    import { useState } from 'react';
 *    import fileService from '../services/fileService';
 * 
 *    const MyComponent = () => {
 *      const [isUploading, setIsUploading] = useState(false);
 *      const [fileList, setFileList] = useState([]);
 *      
 *      // 파일 업로드
 *      const handleFileUpload = async (file) => {
 *        setIsUploading(true);
 *        try {
 *          const result = await fileService.uploadFile(file);
 *          console.log('업로드 성공:', result);
 *          // result.fileId, result.originalName, result.s3Url 등 사용 가능
 *        } catch (error) {
 *          console.error('업로드 실패:', error);
 *        } finally {
 *          setIsUploading(false);
 *        }
 *      };
 *      
 *      // 파일 리스트 조회
 *      const loadFileList = async () => {
 *        try {
 *          const files = await fileService.getFiles();
 *          setFileList(files);
 *        } catch (error) {
 *          console.error('파일 리스트 조회 실패:', error);
 *        }
 *      };
 *      
 *      // 특정 파일 조회
 *      const getFileInfo = async (fileId) => {
 *        try {
 *          const fileInfo = await fileService.getFileById(fileId);
 *          console.log('파일 정보:', fileInfo);
 *        } catch (error) {
 *          console.error('파일 조회 실패:', error);
 *        }
 *      };
 *      
 *      return (
 *        <div>
 *          <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
 *          <button onClick={loadFileList}>파일 목록 불러오기</button>
 *        </div>
 *      );
 *    };
 */
class FileService {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api/files';
    }

    /**
     * 파일 업로드
     * @param {File} file - 업로드할 파일 객체
     * @returns {Promise<Object>} - 업로드 결과 객체 {fileId, originalName, s3Url, ...}
     * @throws {Error} - 업로드 실패 시 에러 발생
     * 
     * 사용 예시:
     * const result = await fileService.uploadFile(selectedFile);
     * console.log('업로드된 파일 ID:', result.fileId);
     * console.log('S3 URL:', result.s3Url);
     */
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('파일 업로드 성공:', result);
                return result;
            } else {
                console.error('파일 업로드 실패');
                throw new Error('파일 업로드에 실패했습니다.');
            }
        } catch (error) {
            console.error('파일 업로드 실패:', error);
            throw new Error('파일 업로드 중 오류가 발생했습니다.');
        }
    }

    /**
     * 모든 파일 리스트 조회
     * @returns {Promise<Array>} - 파일 정보 배열
     * 
     * 사용 예시:
     * const files = await fileService.getFiles();
     * files.forEach(file => {
     *   console.log(`파일명: ${file.originalName}, URL: ${file.s3Url}`);
     * });
     */
    async getFiles() {
        try {
            const response = await fetch(this.baseUrl);
            if (response.ok) {
                return await response.json();
            } else {
                console.error('파일 리스트 조회 실패');
                return [];
            }
        } catch (error) {
            console.error('파일 리스트 조회 실패:', error);
            return [];
        }
    }

    /**
     * 파일 ID로 S3 URL 조회
     * @param {number} fileId - 파일 ID
     * @returns {Promise<string|null>} - S3 URL 또는 null
     * 
     * 사용 예시:
     * const imageUrl = await fileService.getFileUrl(123);
     * if (imageUrl) {
     *   document.getElementById('myImage').src = imageUrl;
     * }
     */
    async getFileUrl(fileId) {
        const fileData = await this.getFileById(fileId);
        return fileData ? fileData.s3Url : null;
    }

    /**
     * 파일 ID로 파일 정보 조회
     * @param {number} fileId - 파일 ID
     * @returns {Promise<Object|null>} - 파일 정보 객체 또는 null
     * 
     * 반환 객체 구조:
     * {
     *   fileId: number,
     *   originalName: string,
     *   s3Key: string,
     *   s3Url: string,
     *   bucketName: string,
     *   fileSize: number,
     *   fileType: string,
     *   uploadBy: string,
     *   uploadDate: string
     * }
     * 
     * 사용 예시:
     * const fileInfo = await fileService.getFileById(123);
     * if (fileInfo) {
     *   console.log('파일명:', fileInfo.originalName);
     *   console.log('파일 크기:', fileInfo.fileSize, 'bytes');
     *   console.log('업로드 날짜:', fileInfo.uploadDate);
     * }
     */
    async getFileById(fileId) {
        if (!fileId) return null;

        try {
            const response = await fetch(`${this.baseUrl}/${fileId}`);
            if (!response.ok) {
                console.error('파일 조회 실패:', fileId);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('파일 조회 오류:', error);
            return null;
        }
    }
}

export default new FileService();
