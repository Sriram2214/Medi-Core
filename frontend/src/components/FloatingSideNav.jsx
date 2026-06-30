import React from 'react';
import { Search, ShieldAlert, GitCompare, MessageSquare } from 'lucide-react';
import './FloatingSideNav.css';

export default function FloatingSideNav({ 
  onSearchClick, 
  onEmergency, 
  onCompare, 
  onChatbot 
}) {
  return (
    <div className="floating-side-nav">
      {/* Search Action */}
      <div className="floating-nav-item appointment" onClick={onSearchClick}>
        <div className="floating-nav-icon">
          <Search size={22} />
        </div>
        <div className="floating-nav-text">Search Hospitals</div>
      </div>

      {/* Emergency Action */}
      <div className="floating-nav-item emergency" onClick={onEmergency}>
        <div className="floating-nav-icon">
          <ShieldAlert size={22} />
        </div>
        <div className="floating-nav-text">Emergency Care</div>
      </div>

      {/* Compare Hospitals Action */}
      <div className="floating-nav-item compare" onClick={onCompare}>
        <div className="floating-nav-icon">
          <GitCompare size={22} />
        </div>
        <div className="floating-nav-text">Compare Hospitals</div>
      </div>

      {/* AI Assistant Action */}
      <div className="floating-nav-item chatbot" onClick={onChatbot}>
        <div className="floating-nav-icon">
          <MessageSquare size={22} />
        </div>
        <div className="floating-nav-text">AI Assistant</div>
      </div>
    </div>
  );
}
