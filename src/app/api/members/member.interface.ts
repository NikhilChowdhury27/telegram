
export interface IListMember {
	groupId: number;
	limit?: number;
	offset?: number;
	search?: string;
}

export interface IAllListMember {
	userId: number;
	limit?: number;
	offset?: number;
	search?: string;
	groupIds?: number[];
	messageIds?: number[];
}