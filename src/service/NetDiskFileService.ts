import NetDiskFile from "@/domain/NetDiskFile";
import axios from "axios";
import {
    URL_NET_DISK_FILE,
    URL_NET_DISK_FILE_AVAILABLE_FILE_SYSTEM_TYPE,
    URL_NET_DISK_FILE_DOWNLOAD_URL, URL_NET_DISK_FILE_UPLOAD, URL_NET_DISK_FILE_UPLOAD_MATERIAL
} from "@/constants/UrlApiNetDiskFile";
import NetDiskFileDto from "@/domain/NetDiskFileDto";
import SortOrder from "@/domain/SortOrder";
import ValueVo from "@/domain/ValueVo";
import {FileSystemTypeEnum} from "@/domain/FileSystemTypeEnum";

export default class NetDiskFileService{
    public static async getAvailableFileSystemTypeList(): Promise<Array<FileSystemTypeEnum>>{
        return await axios.get(URL_NET_DISK_FILE_AVAILABLE_FILE_SYSTEM_TYPE);
    }

    public static async listChildren(id: number, isDirectory: boolean = null, mediaType: string = null, suffix: string = null, sort: SortOrder[] = []): Promise<Array<NetDiskFile>>{
        return await axios.get(
            URL_NET_DISK_FILE,
            {params: {
                    id,
                    isDirectory,
                    mediaType,
                    suffix,
                    sort: sort.map(o=>o.name + "_" + o.direction).join(",")
                }}
        )
    }

    public static async getParents(id: number): Promise<Array<NetDiskFile>>{
        return await axios.get(URL_NET_DISK_FILE + "/" + id + "/parents")
    }

    public static async createDirectory(data: NetDiskFileDto): Promise<NetDiskFile>{
        return await axios.post(URL_NET_DISK_FILE + "/directories", data)
    }

    public static async delete(id: number): Promise<void>{
        await axios.delete(URL_NET_DISK_FILE + "/" + id)
    }

    public static async put(data: NetDiskFileDto): Promise<NetDiskFile>{
        return await axios.put(URL_NET_DISK_FILE, data);
    }

    static async getDetail(id: number): Promise<NetDiskFile>{
        return await axios.get(URL_NET_DISK_FILE + "/" + id)
    }

    static async getDownloadUrl(id: number): Promise<ValueVo<string>>{
        return await axios.get(URL_NET_DISK_FILE_DOWNLOAD_URL + "/" + id);
    }

    static async upload(files: Array<File>, dto: NetDiskFileDto, onUploadProgress?: (progressEvent: any)=>void): Promise<Array<NetDiskFile>>{
        const formData = new FormData()
        for (const file of files) {
            formData.append(file.name, file)
        }
        formData.append("fileInfo", new Blob([JSON.stringify(dto)], {type: "application/json"}));
        return await axios.post(URL_NET_DISK_FILE_UPLOAD, formData, {onUploadProgress})
    }

    static async uploadMaterial(group: string, material: File, onUploadProgress?: (progressEvent: any)=>void): Promise<NetDiskFile>{
        const formData = new FormData();
        formData.append("material", material);
        formData.append("group", group);
        return await axios.post(URL_NET_DISK_FILE_UPLOAD_MATERIAL, formData, {onUploadProgress})
    }
}
