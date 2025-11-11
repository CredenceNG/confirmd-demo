import { prisma } from "@/lib/prisma";

export default async function PostsPage() {
  // Fetch posts from database (will work after running migrations)
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      include: { author: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch (error) {
    console.log("Database not initialized yet");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Posts</h1>
        <button className="btn-primary">
          Create New Post
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">All Posts</h3>
        </div>
        <div className="card-body">
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No posts found. Run the database migration and seed to get started.
              </p>
              <div className="space-y-2">
                <code className="bg-gray-100 px-4 py-2 rounded text-sm block">
                  npx prisma migrate dev --name init
                </code>
                <code className="bg-gray-100 px-4 py-2 rounded text-sm block">
                  npx prisma db seed
                </code>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.author.name || post.author.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            post.published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
