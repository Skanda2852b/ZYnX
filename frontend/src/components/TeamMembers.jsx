import React from "react";

const TeamMemberCard = ({ member }) => {
  return (
    <div className="bg-purple-900/20 p-6 rounded-2xl">
      <h3 className="text-xl font-semibold text-purple-300">
        {member.real_name}
      </h3>
      {member.phone_number && (
        <div className="mt-2">
          <span className="text-gray-400">Contact: </span>
          <span className="text-purple-200">{member.phone_number}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-4">
        {member.skills?.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-purple-800/30 text-purple-300 rounded-full text-xs"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TeamMemberCard;
