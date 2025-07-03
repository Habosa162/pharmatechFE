export interface PositionDto {
  id: number;
  name: string;
  departmentName: string;
}

export interface CreatePosition {
  name: string;
  departmentId: number;
}

export interface UpdatePosition {
  name: string;
  departmentId: number;
}

