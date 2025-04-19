export interface Post {
  id: number;
  user_id: number;
  category_id?: number;
  title: string;
  content: string;
  type: string;
  location?: string;
  coordinates: {
    x: number;
    y: number;
  };
  is_approved: number;
  likes_count: number;
  comments_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface PostImage {
  id: number;
  post_id: number;
  image_url: string;
  sequence_number: number;
  created_at: Date;
}

export interface PostLike {
  id: number;
  post_id: number;
  user_id: number;
  created_at: Date;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  parent_id?: number;
  likes_count: number;
  created_at: Date;
  updated_at: Date;
}
