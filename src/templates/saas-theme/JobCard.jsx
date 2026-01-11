
import React from 'react';

const JobCard = ({ title, company, type, salary, timePosted, logoUrl }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {company ? company[0] : 'C'}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{title}</h3>
                        <p className="text-sm text-slate-500">{company}</p>
                    </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{type}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <span>💰 {salary}</span>
                <span>📍 Remote</span>
            </div>

            <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">{timePosted}</span>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Apply Now</button>
            </div>
        </div>
    );
};

export default JobCard;
