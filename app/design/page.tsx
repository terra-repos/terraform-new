import Link from "next/link";
import { Book, Upload, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 ">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
            What would you like to create?
          </h1>
          <p className="text-neutral-500 text-lg">
            Choose an option to get started
          </p>
        </div>

        {/* Three action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Browse Catalog */}
          <Link
            href="/design/catalog"
            className="group relative flex flex-col p-8 rounded-3xl bg-white border border-[#E5E7EB] hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
              <Book className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Browse Catalog
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Explore our ready-made products and add them to your sample order
            </p>
            <div className="mt-auto flex items-center text-sm font-medium text-neutral-400 group-hover:text-orange-500 transition-colors">
              <span>Explore</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Upload Product */}
          <Link
            href="/upload"
            className="group relative flex flex-col p-8 rounded-3xl bg-white border border-[#E5E7EB] hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
              <Upload className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Upload Product
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Submit images of items you want sourced with your specifications
            </p>
            <div className="mt-auto flex items-center text-sm font-medium text-neutral-400 group-hover:text-orange-500 transition-colors">
              <span>Upload</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Design from Scratch */}
          <Link
            href="/design/scratch"
            className="group relative flex flex-col p-8 rounded-3xl bg-white border border-[#E5E7EB] hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Design from Scratch
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Use our AI assistant to create custom product designs from your
              ideas
            </p>
            <div className="mt-auto flex items-center text-sm font-medium text-neutral-400 group-hover:text-orange-500 transition-colors">
              <span>Create</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* My Designs link */}
        <div className="mt-16 text-center">
          <Link
            href="/designs"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-orange-500 transition-colors"
          >
            View my existing designs
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
