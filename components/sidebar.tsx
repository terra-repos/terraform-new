"use client";

import Image from "next/image";
import {
  Box,
  CheckCircle,
  ChevronDown,
  Clock,
  LayoutDashboard,
  LineChart,
  Menu,
  Package,
  PanelLeftOpen,
  PanelRightOpen,
  Palette,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

type NavItem = { label: string; icon: React.ElementType; href?: string };

type NavSection = {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Designs",
    icon: Palette,
    items: [
      { label: "In Progress", icon: Clock },
      { label: "Finalized", icon: CheckCircle },
    ],
  },
  {
    label: "Store",
    icon: Store,
    items: [
      { label: "Store Design", icon: LayoutDashboard },
      { label: "Products", icon: Box },
      { label: "Orders", icon: ShoppingCart },
      { label: "Analytics", icon: LineChart },
    ],
  },
  {
    label: "Samples",
    icon: Package,
    items: [{ label: "Orders", icon: Truck }],
  },
];

// Tooltip component using state for positioning
function TooltipButton({
  children,
  label,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
    }
    setShow(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        className={className}
      >
        {children}
      </button>
      {show && (
        <div
          className="fixed z-[9999] -translate-y-1/2 pointer-events-none"
          style={{ top: position.top, left: position.left }}
        >
          <div className="whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
            {label}
          </div>
        </div>
      )}
    </>
  );
}

type SidebarProps = {
  isOpen?: boolean;
  onToggle?: () => void;
};

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Designs",
    "Store",
    "Samples",
  ]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Shared nav content for both mobile and desktop
  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {navSections.map((section) => {
        const isExpanded = expandedSections.includes(section.label);
        const SectionIcon = section.icon;

        return (
          <div key={section.label} className="mb-2">
            <button
              onClick={() => toggleSection(section.label)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <SectionIcon className="h-5 w-5 shrink-0 text-slate-500" />
              <span className="flex-1 text-left">{section.label}</span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isExpanded ? "" : "-rotate-90"
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-200 ${
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="ml-4 border-l border-slate-100 pl-2">
                {section.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.label}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                    >
                      <ItemIcon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>

        <span className="text-lg font-semibold text-slate-900">TerraForm</span>

        {/* Empty div to keep title centered */}
        <div className="w-10" />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute left-0 right-0 top-0 max-h-[85vh] overflow-y-auto rounded-b-2xl bg-white shadow-xl animate-in slide-in-from-top duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-1">
                <Image
                  src="https://images.useterra.com/logo/1766471182424-2upmie.webp"
                  alt="Terra"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
                <span className="text-lg font-semibold text-slate-900">
                  TerraForm
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Nav Content */}
            <div className="p-3">
              <NavContent isMobile />
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-3">
              <div
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>Settings</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition hover:bg-slate-50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                  GG
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    Geoffrey Guindine
                  </p>
                  <p className="text-xs text-slate-500">Pro Plan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - hidden on mobile */}
      <aside
        className={`hidden md:flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white py-5 transition-all duration-300 ease-in-out ${
          isOpen ? "w-[260px] px-3" : "w-16 px-2"
        }`}
      >
        {/* Header */}
        <div
          className={`flex shrink-0 items-center pb-6 ${
            isOpen ? "justify-between px-2" : "justify-center"
          }`}
        >
          {isOpen ? (
            <button
              onClick={onToggle}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
            >
              <Image
                src="https://images.useterra.com/logo/1766471182424-2upmie.webp"
                alt="Terra"
                width={28}
                height={28}
                className="h-7 w-7 object-contain transition-opacity duration-200 group-hover:opacity-0"
                priority
              />
              <PanelRightOpen className="absolute h-5 w-5 text-slate-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </button>
          ) : (
            <TooltipButton
              label="Open sidebar"
              onClick={onToggle}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
            >
              <Image
                src="https://images.useterra.com/logo/1766471182424-2upmie.webp"
                alt="Terra"
                width={28}
                height={28}
                className="h-7 w-7 object-contain transition-opacity duration-200 group-hover:opacity-0"
              />
              <PanelLeftOpen className="absolute h-5 w-5 text-slate-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </TooltipButton>
          )}

          {isOpen && (
            <span className="text-lg font-semibold text-slate-900">
              TerraForm
            </span>
          )}

          {isOpen && <div className="w-10" />}
        </div>

        {/* Scrollable content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {isOpen ? (
            <NavContent />
          ) : (
            // Collapsed view - main section icons only with tooltips
            <div className="flex flex-col items-center gap-1">
              {navSections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <TooltipButton
                    key={section.label}
                    label={section.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <SectionIcon className="h-5 w-5" />
                  </TooltipButton>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile section - fixed at bottom */}
        <div
          className={`shrink-0 border-t border-slate-100 pt-3 ${
            isOpen ? "" : "flex flex-col items-center"
          }`}
        >
          {/* Settings */}
          {isOpen ? (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
              <Settings className="h-4 w-4 shrink-0" />
              <span>Settings</span>
            </div>
          ) : (
            <TooltipButton
              label="Settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Settings className="h-5 w-5" />
            </TooltipButton>
          )}

          {/* User avatar */}
          {isOpen ? (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition hover:bg-slate-50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                GG
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  Geoffrey Guindine
                </p>
                <p className="text-xs text-slate-500">Pro Plan</p>
              </div>
            </div>
          ) : (
            <TooltipButton
              label="Geoffrey Guindine"
              className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                GG
              </div>
            </TooltipButton>
          )}
        </div>
      </aside>
    </>
  );
}
