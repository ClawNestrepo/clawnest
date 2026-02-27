import { motion } from 'motion/react';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: "Introducing ClawNest: The Future of Autonomous Agents",
    excerpt: "We're excited to announce the public beta of ClawNest, the first managed hosting platform designed specifically for OpenClaw agents.",
    author: "Sarah Chen",
    date: "Feb 24, 2026",
    readTime: "5 min read",
    category: "Product",
    image: "https://picsum.photos/seed/blog1/800/400"
  },
  {
    id: 2,
    title: "Scaling AI Agents: Best Practices for Production",
    excerpt: "Learn how to optimize your agent's performance and manage resources effectively when scaling from one to dozens of instances.",
    author: "Marcus Rodriguez",
    date: "Feb 20, 2026",
    readTime: "8 min read",
    category: "Engineering",
    image: "https://picsum.photos/seed/blog2/800/400"
  },
  {
    id: 3,
    title: "Security First: How We Protect Your Agent Data",
    excerpt: "A deep dive into our security architecture, from encrypted storage to isolated runtime environments.",
    author: "Emma Wilson",
    date: "Feb 15, 2026",
    readTime: "6 min read",
    category: "Security",
    image: "https://picsum.photos/seed/blog3/800/400"
  }
];

export const Blog = () => {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Latest Updates & Insights
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            News, tutorials, and engineering deep dives from the ClawNest team.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {post.author.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-300">{post.author}</span>
                  </div>
                  <Link to="#" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                    Read more
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};
