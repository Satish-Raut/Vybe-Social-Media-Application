import React from "react";
import { menuItemsData } from "../assets/assets";
import { NavLink } from "react-router-dom";

const MenuItems = ({ setSidebarOpen }) => {
    return (
        <div className="px-6 text-gray-600 space-y-1 font-medium">
            {menuItemsData.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                        `px-3.5 py-2.5 flex items-center gap-3 rounded-xl transition-all ${isActive ? "bg-gradient-to-r from-indigo-50 to-indigo-100/50 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-500/10" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`
                    }
                ><item.Icon className="w-5 h-5" />
                    {item.label}
                </NavLink>
            ))}
        </div>
    );
};

export default MenuItems;