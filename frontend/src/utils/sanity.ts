import { sanityClient } from "sanity:client";
import groq from "groq";

const visualEditingEnabled = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";
const token = import.meta.env.SANITY_API_READ_TOKEN;

async function loadQuery<T>(query: string, params: Record<string, any> = {}): Promise<T> {
  return sanityClient.fetch<T>(
    query,
    params,
    {
      perspective: visualEditingEnabled ? 'drafts' : 'published',
      useCdn: !visualEditingEnabled,
      ...(visualEditingEnabled && token ? { token, stega: true } : {}),
    }
  );
}

export async function getPosts(): Promise<Post[]> {
  return loadQuery<Post[]>(
    groq`*[_type == "blog.post"] | order(publishDate desc) {
      ...,
      "slug": metadata.slug.current,
      "categories": categories[]->title
    }`,
  );
}

export async function getPost(slug: string): Promise<Post> {
  return loadQuery<Post>(
    groq`*[_type == "blog.post" && metadata.slug.current == $slug][0] {
      ...,
      "slug": metadata.slug.current
    }`,
    { slug },
  );
}

export interface Post {
  _id: string;
  _type: "blog.post";
  _createdAt: string;
  title?: string;
  slug: string;
  content: any[];
  publishDate?: string;
  categories?: string[];
  metadata?: {
    title?: string;
    description?: string;
    slug?: { current: string };
    image?: any;
  };
  }
