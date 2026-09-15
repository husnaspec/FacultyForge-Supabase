export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'ADMIN' | 'HOD' | 'FACULTY';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          faculty_id: number | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          faculty_id?: number | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          faculty_id?: number | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: number;
          name: string;
          code: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          code: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          code?: string;
          description?: string | null;
          is_active?: boolean;
        };
      };
      faculty: {
        Row: {
          id: number;
          faculty_code: string;
          full_name: string;
          email: string;
          department_id: number;
          designation: string;
          qualification: string;
          years_of_experience: number;
          teaching_interests: string | null;
          research_interests: string | null;
          existing_skills: string | null;
          development_interests: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          faculty_code: string;
          full_name: string;
          email: string;
          department_id: number;
          designation: string;
          qualification: string;
          years_of_experience?: number;
          teaching_interests?: string | null;
          research_interests?: string | null;
          existing_skills?: string | null;
          development_interests?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          faculty_code?: string;
          full_name?: string;
          email?: string;
          department_id?: number;
          designation?: string;
          qualification?: string;
          years_of_experience?: number;
          teaching_interests?: string | null;
          research_interests?: string | null;
          existing_skills?: string | null;
          development_interests?: string | null;
          phone?: string | null;
          is_active?: boolean;
        };
      };
      resource_persons: {
        Row: {
          id: number;
          name: string;
          email: string;
          phone: string | null;
          organization: string;
          designation: string;
          expertise: string;
          topics: string | null;
          biography: string | null;
          years_of_experience: number;
          total_sessions: number;
          average_rating: number;
          honorarium_expectation: string | null;
          travel_required: boolean;
          availability_notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          email: string;
          phone?: string | null;
          organization: string;
          designation: string;
          expertise: string;
          topics?: string | null;
          biography?: string | null;
          years_of_experience?: number;
          total_sessions?: number;
          average_rating?: number;
          honorarium_expectation?: string | null;
          travel_required?: boolean;
          availability_notes?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          organization?: string;
          designation?: string;
          expertise?: string;
          topics?: string | null;
          biography?: string | null;
          years_of_experience?: number;
          total_sessions?: number;
          average_rating?: number;
          honorarium_expectation?: string | null;
          travel_required?: boolean;
          availability_notes?: string | null;
          is_active?: boolean;
        };
      };
      events: {
        Row: {
          id: number;
          event_code: string;
          title: string;
          description: string | null;
          event_type: string;
          objectives: string | null;
          target_audience: string | null;
          eligibility: string | null;
          start_date: string | null;
          end_date: string | null;
          duration_hours: number;
          capacity: number;
          delivery_mode: string;
          venue: string | null;
          department_id: number;
          coordinator_faculty_id: number | null;
          status: string;
          expected_outcomes: string | null;
          learning_outcomes: string | null;
          estimated_budget: number;
          actual_expenditure: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          event_code: string;
          title: string;
          description?: string | null;
          event_type?: string;
          objectives?: string | null;
          target_audience?: string | null;
          eligibility?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          duration_hours?: number;
          capacity?: number;
          delivery_mode?: string;
          venue?: string | null;
          department_id: number;
          coordinator_faculty_id?: number | null;
          status?: string;
          expected_outcomes?: string | null;
          learning_outcomes?: string | null;
          estimated_budget?: number;
          actual_expenditure?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          event_code?: string;
          title?: string;
          description?: string | null;
          event_type?: string;
          objectives?: string | null;
          target_audience?: string | null;
          eligibility?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          duration_hours?: number;
          capacity?: number;
          delivery_mode?: string;
          venue?: string | null;
          department_id?: number;
          coordinator_faculty_id?: number | null;
          status?: string;
          expected_outcomes?: string | null;
          learning_outcomes?: string | null;
          estimated_budget?: number;
          actual_expenditure?: number;
          updated_at?: string;
        };
      };
      event_sessions: {
        Row: {
          id: number;
          event_id: number;
          title: string;
          description: string | null;
          session_date: string | null;
          start_time: string | null;
          end_time: string | null;
          resource_person_id: number | null;
          learning_objective: string | null;
          room_or_link: string | null;
        };
        Insert: {
          id?: number;
          event_id: number;
          title: string;
          description?: string | null;
          session_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          resource_person_id?: number | null;
          learning_objective?: string | null;
          room_or_link?: string | null;
        };
        Update: {
          event_id?: number;
          title?: string;
          description?: string | null;
          session_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          resource_person_id?: number | null;
          learning_objective?: string | null;
          room_or_link?: string | null;
        };
      };
      proposals: {
        Row: {
          id: number;
          event_id: number;
          submitted_by: string;
          submitted_at: string;
          approval_status: string;
          approver_name: string | null;
          approver_role: string | null;
          remarks: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: number;
          event_id: number;
          submitted_by: string;
          submitted_at?: string;
          approval_status?: string;
          approver_name?: string | null;
          approver_role?: string | null;
          remarks?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          approval_status?: string;
          approver_name?: string | null;
          approver_role?: string | null;
          remarks?: string | null;
          reviewed_at?: string | null;
        };
      };
      registrations: {
        Row: {
          id: number;
          event_id: number;
          faculty_id: number | null;
          participant_name: string | null;
          faculty_code: string | null;
          email: string | null;
          phone: string | null;
          department: string | null;
          designation: string | null;
          institution_name: string | null;
          years_of_experience: number | null;
          teaching_interests: string | null;
          research_interests: string | null;
          registration_code: string | null;
          registration_token: string | null;
          qr_token: string | null;
          registered_at: string;
          registration_status: string;
          eligibility_status: string;
          completion_status: string;
          attendance_status: string;
        };
        Insert: {
          id?: number;
          event_id: number;
          faculty_id?: number | null;
          participant_name?: string | null;
          faculty_code?: string | null;
          email?: string | null;
          phone?: string | null;
          department?: string | null;
          designation?: string | null;
          institution_name?: string | null;
          years_of_experience?: number | null;
          teaching_interests?: string | null;
          research_interests?: string | null;
          registration_code?: string | null;
          registration_token?: string | null;
          qr_token?: string | null;
          registered_at?: string;
          registration_status?: string;
          eligibility_status?: string;
          completion_status?: string;
          attendance_status?: string;
        };
        Update: {
          registration_status?: string;
          eligibility_status?: string;
          completion_status?: string;
          attendance_status?: string;
        };
      };
      attendances: {
        Row: {
          id: number;
          event_id: number;
          session_id: number | null;
          faculty_id: number | null;
          registration_id: number | null;
          attendance_date: string;
          attendance_status: string;
          attendance_method: string;
          check_in_time: string;
        };
        Insert: {
          id?: number;
          event_id: number;
          session_id?: number | null;
          faculty_id?: number | null;
          registration_id?: number | null;
          attendance_date?: string;
          attendance_status?: string;
          attendance_method?: string;
          check_in_time?: string;
        };
        Update: {
          attendance_status?: string;
          attendance_method?: string;
          check_in_time?: string;
        };
      };
      assessments: {
        Row: {
          id: number;
          event_id: number;
          assessment_type: 'PRE' | 'POST';
          title: string;
          total_marks: number;
          passing_marks: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          event_id: number;
          assessment_type: 'PRE' | 'POST';
          title: string;
          total_marks?: number;
          passing_marks?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          total_marks?: number;
          passing_marks?: number;
        };
      };
      assessment_questions: {
        Row: {
          id: number;
          assessment_id: number;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: string;
          marks: number;
          explanation: string | null;
        };
        Insert: {
          id?: number;
          assessment_id: number;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: string;
          marks?: number;
          explanation?: string | null;
        };
        Update: {
          question_text?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          correct_option?: string;
          marks?: number;
          explanation?: string | null;
        };
      };
      assessment_attempts: {
        Row: {
          id: number;
          assessment_id: number;
          faculty_id: number;
          score: number;
          percentage: number;
          submitted_at: string;
        };
        Insert: {
          id?: number;
          assessment_id: number;
          faculty_id: number;
          score: number;
          percentage: number;
          submitted_at?: string;
        };
        Update: {
          score?: number;
          percentage?: number;
          submitted_at?: string;
        };
      };
      feedbacks: {
        Row: {
          id: number;
          event_id: number;
          faculty_id: number;
          content_rating: number;
          trainer_rating: number;
          relevance_rating: number;
          practical_rating: number;
          organization_rating: number;
          comments: string | null;
          suggestions: string | null;
          submitted_at: string;
        };
        Insert: {
          id?: number;
          event_id: number;
          faculty_id: number;
          content_rating: number;
          trainer_rating: number;
          relevance_rating: number;
          practical_rating?: number;
          organization_rating: number;
          comments?: string | null;
          suggestions?: string | null;
          submitted_at?: string;
        };
        Update: {
          content_rating?: number;
          trainer_rating?: number;
          relevance_rating?: number;
          practical_rating?: number;
          organization_rating?: number;
          comments?: string | null;
          suggestions?: string | null;
        };
      };
      certificates: {
        Row: {
          id: number;
          certificate_code: string;
          event_id: number;
          faculty_id: number;
          issue_date: string;
          training_hours: number;
          verification_token: string;
          qr_data: string | null;
          status: string;
        };
        Insert: {
          id?: number;
          certificate_code: string;
          event_id: number;
          faculty_id: number;
          issue_date?: string;
          training_hours?: number;
          verification_token: string;
          qr_data?: string | null;
          status?: string;
        };
        Update: {
          status?: string;
        };
      };
      compliance_rules: {
        Row: {
          id: number;
          rule_name: string;
          description: string | null;
          minimum_training_hours: number;
          period_type: string;
          required_topics: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          rule_name: string;
          description?: string | null;
          minimum_training_hours?: number;
          period_type?: string;
          required_topics?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          rule_name?: string;
          description?: string | null;
          minimum_training_hours?: number;
          period_type?: string;
          required_topics?: string | null;
          is_active?: boolean;
        };
      };
      faculty_compliance: {
        Row: {
          id: number;
          faculty_id: number;
          compliance_rule_id: number;
          completed_hours: number;
          required_hours: number;
          compliance_percentage: number;
          status: string;
          last_calculated: string;
        };
        Insert: {
          id?: number;
          faculty_id: number;
          compliance_rule_id: number;
          completed_hours?: number;
          required_hours?: number;
          compliance_percentage?: number;
          status?: string;
          last_calculated?: string;
        };
        Update: {
          completed_hours?: number;
          required_hours?: number;
          compliance_percentage?: number;
          status?: string;
          last_calculated?: string;
        };
      };
      faculty_skills: {
        Row: {
          id: number;
          faculty_id: number;
          skill_name: string;
          proficiency_level: string;
          source: string;
          verification_status: string;
          last_updated: string;
        };
        Insert: {
          id?: number;
          faculty_id: number;
          skill_name: string;
          proficiency_level?: string;
          source?: string;
          verification_status?: string;
          last_updated?: string;
        };
        Update: {
          proficiency_level?: string;
          source?: string;
          verification_status?: string;
          last_updated?: string;
        };
      };
      skill_gaps: {
        Row: {
          id: number;
          faculty_id: number;
          skill_name: string;
          current_level: string;
          required_level: string;
          gap_score: number;
          priority: string;
          explanation: string | null;
          identified_at: string;
          status: string;
        };
        Insert: {
          id?: number;
          faculty_id: number;
          skill_name: string;
          current_level?: string;
          required_level?: string;
          gap_score?: number;
          priority?: string;
          explanation?: string | null;
          identified_at?: string;
          status?: string;
        };
        Update: {
          current_level?: string;
          required_level?: string;
          gap_score?: number;
          priority?: string;
          explanation?: string | null;
          status?: string;
        };
      };
      training_recommendations: {
        Row: {
          id: number;
          faculty_id: number;
          title: string;
          topic: string;
          priority: string;
          reason: string | null;
          recommended_duration: string;
          recommended_event_id: number | null;
          confidence_score: number;
          generated_at: string;
          status: string;
        };
        Insert: {
          id?: number;
          faculty_id: number;
          title: string;
          topic: string;
          priority?: string;
          reason?: string | null;
          recommended_duration?: string;
          recommended_event_id?: number | null;
          confidence_score?: number;
          generated_at?: string;
          status?: string;
        };
        Update: {
          title?: string;
          topic?: string;
          priority?: string;
          reason?: string | null;
          recommended_duration?: string;
          recommended_event_id?: number | null;
          confidence_score?: number;
          status?: string;
        };
      };
      agent_analyses: {
        Row: {
          id: number;
          agent_name: string;
          faculty_id: number | null;
          event_id: number | null;
          input_summary: string | null;
          output_json: string;
          confidence_score: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          agent_name: string;
          faculty_id?: number | null;
          event_id?: number | null;
          input_summary?: string | null;
          output_json: string;
          confidence_score?: number;
          created_at?: string;
        };
        Update: {
          output_json?: string;
          confidence_score?: number;
        };
      };
      skill_evidence: {
        Row: {
          id: number;
          faculty_id: number;
          skill_name: string;
          evidence_type: string;
          evidence_reference: string;
          score: number | null;
          verified: boolean;
          verified_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          faculty_id: number;
          skill_name: string;
          evidence_type: string;
          evidence_reference: string;
          score?: number | null;
          verified?: boolean;
          verified_by?: string | null;
          created_at?: string;
        };
        Update: {
          verified?: boolean;
          verified_by?: string | null;
          score?: number | null;
        };
      };
      teaching_impacts: {
        Row: {
          id: number;
          faculty_id: number;
          event_id: number | null;
          skill_name: string;
          application_type: string;
          application_description: string;
          evidence_url: string | null;
          self_rating: number;
          reviewer_rating: number | null;
          impact_status: string;
          applied_at: string | null;
          created_at: string;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          id?: number;
          faculty_id: number;
          event_id?: number | null;
          skill_name: string;
          application_type: string;
          application_description: string;
          evidence_url?: string | null;
          self_rating?: number;
          reviewer_rating?: number | null;
          impact_status?: string;
          applied_at?: string | null;
          created_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          reviewer_rating?: number | null;
          impact_status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
      };
    };
  };
}
