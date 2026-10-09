export type ContentRecord={id:number;resource:string;name:string;slug:string;summary:string;category:string;status:string;published:boolean;featured:boolean;sortOrder:number;data:Record<string,any>;createdAt:string;updatedAt:string;version:number};
export type Page<T>={items:T[];total:number;page:number;size:number;totalPages:number};
export type Snapshot=Record<string,ContentRecord[]>;
export type Session={email:string;roles:string[];mode:string;displayName?:string;authMethod?:string};
export const projectStatuses=['CONCEPT','PROTOTYPE','DEVELOPMENT','PRODUCTION','ARCHIVED'];
export const allStatuses=[...projectStatuses,'IMPLEMENTED','PLANNED','LEARNING','PERSONAL_PROJECT'];
